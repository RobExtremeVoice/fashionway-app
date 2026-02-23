import { Controller, Post, Headers, Req, HttpCode, RawBodyRequest } from '@nestjs/common'
import { Request } from 'express'
import Stripe from 'stripe'
import { StripeService } from './stripe.service'
import { PrismaService } from '../common/prisma/prisma.service'
import { ColetaService } from '../coleta/coleta.service'

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly coletaService: ColetaService,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    let event: Stripe.Event

    try {
      event = this.stripeService.constructWebhookEvent(req.rawBody!, sig)
    } catch {
      return { error: 'Invalid signature' }
    }

    switch (event.type) {

      // ── Pagamento confirmado ──────────────────────────────────────────
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent
        const charge = intent.latest_charge as string | undefined

        await this.prisma.payment.updateMany({
          where: { stripePaymentIntentId: intent.id },
          data: {
            status: 'CONFIRMADO',
            stripeChargeId: charge ?? null,
            paidAt: new Date(),
          },
        })

        // Muda coleta de NOVA → PENDENTE (disponível para motoboys)
        const payment = await this.prisma.payment.findUnique({
          where: { stripePaymentIntentId: intent.id },
        })
        if (payment) {
          await this.prisma.coleta.update({
            where: { id: payment.coletaId },
            data: {
              status: 'PENDENTE',
              statusHistory: {
                create: { status: 'PENDENTE', note: 'Pagamento confirmado' },
              },
            },
          })
        }
        break
      }

      // ── Pagamento falhou ──────────────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent
        await this.prisma.payment.updateMany({
          where: { stripePaymentIntentId: intent.id },
          data: { status: 'FALHOU' },
        })
        break
      }

      // ── Transfer para motoboy criado ──────────────────────────────────
      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        await this.prisma.payout.updateMany({
          where: { stripeTransferId: transfer.id },
          data: { status: 'PROCESSANDO' },
        })
        break
      }

      // ── Payout pago ───────────────────────────────────────────────────
      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout
        await this.prisma.payout.updateMany({
          where: { stripePayoutId: payout.id },
          data: { status: 'PAGO', processedAt: new Date() },
        })
        break
      }

      // ── Disputa/chargeback ────────────────────────────────────────────
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        const chargeId = dispute.charge as string

        const payment = await this.prisma.payment.findFirst({
          where: { stripeChargeId: chargeId },
        })

        if (payment) {
          await this.prisma.disputa.upsert({
            where: { coletaId: payment.coletaId },
            create: {
              coletaId: payment.coletaId,
              abertaPor: 'system',
              motivo: 'Chargeback via Stripe',
              stripeDisputaId: dispute.id,
              status: 'ABERTA',
            },
            update: { stripeDisputaId: dispute.id },
          })

          await this.prisma.coleta.update({
            where: { id: payment.coletaId },
            data: { status: 'DISPUTA' },
          })
        }
        break
      }

      // ── Conta conectada ativada ────────────────────────────────────────
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        if (account.charges_enabled) {
          await this.prisma.user.updateMany({
            where: { stripeAccountId: account.id },
            data: { stripeAccountStatus: 'active' },
          })
        }
        break
      }
    }

    return { received: true }
  }
}
