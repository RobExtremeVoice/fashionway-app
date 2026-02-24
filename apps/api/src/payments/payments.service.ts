import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PaymentMethod, PaymentStatus, Role } from '@prisma/client'
import { PrismaService } from '../common/prisma/prisma.service'
import { StripeService } from '../stripe/stripe.service'
import { CreatePaymentDto } from './dto/create-payment.dto'

interface AuthUser {
  id: string
  role: Role
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  async create(user: AuthUser, dto: CreatePaymentDto) {
    const coleta = await this.prisma.coleta.findUnique({
      where: { id: dto.coletaId },
      include: { payment: true },
    })

    if (!coleta) throw new NotFoundException('Coleta não encontrada')
    this.assertCanPay(user, coleta)

    if (coleta.payment) {
      return {
        id: coleta.payment.id,
        stripePaymentIntentId: coleta.payment.stripePaymentIntentId,
        status: coleta.payment.status,
      }
    }

    const customerId = await this.ensureStripeCustomer(user.id)

    const method = this.mapMethod(dto.method)
    const intent = await this.stripe.createPaymentIntent({
      amountCents: coleta.valorFrete,
      platformFeeCents: coleta.taxaPlataforma,
      stripeCustomerId: customerId,
      method: dto.method,
      coletaId: coleta.id,
      trackingCode: coleta.trackingCode,
    })

    const pixData = this.extractPixData(intent)

    const payment = await this.prisma.payment.create({
      data: {
        coletaId: coleta.id,
        userId: user.id,
        stripePaymentIntentId: intent.id,
        stripeClientSecret: intent.client_secret ?? null,
        amount: coleta.valorFrete,
        currency: 'brl',
        method,
        status: 'PENDENTE',
        pixQrCode: pixData.qrCode,
        pixCopyPaste: pixData.copyPaste,
        pixExpiresAt: pixData.expiresAt,
      },
    })

    return {
      id: payment.id,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      status: payment.status,
    }
  }

  async getPix(user: AuthUser, paymentIntentId: string) {
    const payment = await this.findOwnedPayment(user, paymentIntentId)

    let qrCode = payment.pixQrCode
    let copyPaste = payment.pixCopyPaste

    // Tenta atualizar os dados PIX com o intent atual do Stripe
    try {
      const intent = await this.stripe.getPaymentIntent(paymentIntentId)
      const pixData = this.extractPixData(intent)

      qrCode = pixData.qrCode ?? qrCode
      copyPaste = pixData.copyPaste ?? copyPaste

      if (pixData.qrCode !== payment.pixQrCode || pixData.copyPaste !== payment.pixCopyPaste) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            pixQrCode: qrCode,
            pixCopyPaste: copyPaste,
            pixExpiresAt: pixData.expiresAt ?? payment.pixExpiresAt,
          },
        })
      }
    } catch {
      // Evita quebrar o app se Stripe estiver temporariamente indisponível
    }

    return {
      qrCode,
      copyPaste,
      expiresAt: payment.pixExpiresAt,
    }
  }

  async getStatus(user: AuthUser, paymentIntentId: string) {
    const payment = await this.findOwnedPayment(user, paymentIntentId)

    try {
      const intent = await this.stripe.getPaymentIntent(paymentIntentId)

      if (intent.status === 'succeeded' && payment.status !== 'CONFIRMADO') {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'CONFIRMADO', paidAt: new Date() },
        })
        return { paid: true, status: 'CONFIRMADO' as PaymentStatus }
      }

      if (intent.status === 'canceled' && payment.status === 'PENDENTE') {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FALHOU' },
        })
        return { paid: false, status: 'FALHOU' as PaymentStatus }
      }
    } catch {
      // Fallback para status persistido
    }

    return {
      paid: payment.status === 'CONFIRMADO',
      status: payment.status,
    }
  }

  private async ensureStripeCustomer(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        lojaProfile: true,
        intermediarioProfile: true,
        motoboyProfile: true,
        transportadoraProfile: true,
      },
    })

    if (!user) throw new NotFoundException('Usuário não encontrado')

    if (user.stripeCustomerId) return user.stripeCustomerId

    const name = user.lojaProfile?.nomeEmpresa
      ?? user.intermediarioProfile?.nomeEmpresa
      ?? user.motoboyProfile?.nomeCompleto
      ?? user.transportadoraProfile?.nomeEmpresa
      ?? user.email

    const customerId = await this.stripe.createCustomer({
      email: user.email,
      phone: user.phone,
      name,
      userId: user.id,
    })

    await this.prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    })

    return customerId
  }

  private mapMethod(method: CreatePaymentDto['method']): PaymentMethod {
    if (method === 'pix') return 'PIX'
    if (method === 'card') return 'CARTAO'
    if (method === 'boleto') return 'BOLETO'
    throw new BadRequestException('Método de pagamento inválido')
  }

  private assertCanPay(user: AuthUser, coleta: {
    lojaId: string | null
    intermediarioId: string | null
    payment: unknown
  }) {
    if (coleta.payment) throw new BadRequestException('Pagamento já criado para esta coleta')

    const ownsByLoja = Boolean(coleta.lojaId && coleta.lojaId === user.id)
    const ownsByIntermediario = Boolean(coleta.intermediarioId && coleta.intermediarioId === user.id)

    if (!ownsByLoja && !ownsByIntermediario) {
      throw new ForbiddenException('Você não pode pagar esta coleta')
    }
  }

  private async findOwnedPayment(user: AuthUser, paymentIntentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId,
        userId: user.id,
      },
    })

    if (!payment) throw new NotFoundException('Pagamento não encontrado')

    return payment
  }

  private extractPixData(intent: { next_action: unknown }) {
    const nextAction = intent.next_action as {
      pix_display_qr_code?: {
        data?: string
        image_url_png?: string
        expires_at?: number
      }
    } | null

    const pix = nextAction?.pix_display_qr_code

    return {
      qrCode: pix?.image_url_png ?? null,
      copyPaste: pix?.data ?? null,
      expiresAt: pix?.expires_at ? new Date(pix.expires_at * 1000) : null,
    }
  }
}
