import { Injectable, BadRequestException } from '@nestjs/common'
import Stripe from 'stripe'

@Injectable()
export class StripeService {
  readonly stripe: Stripe

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    })
  }

  // ─── CUSTOMERS ────────────────────────────────────────────────────────

  async createCustomer(params: {
    email: string
    phone: string
    name: string
    userId: string
  }): Promise<string> {
    const customer = await this.stripe.customers.create({
      email: params.email,
      phone: params.phone,
      name: params.name,
      metadata: { fashionway_user_id: params.userId },
    })
    return customer.id
  }

  // ─── CONNECTED ACCOUNTS (Motoboy/Transportadora) ──────────────────────

  async createConnectedAccount(params: {
    email: string
    userId: string
    role: 'MOTOBOY' | 'TRANSPORTADORA'
  }): Promise<string> {
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'BR',
      email: params.email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      metadata: {
        fashionway_user_id: params.userId,
        fashionway_role: params.role,
      },
    })
    return account.id
  }

  async createOnboardingLink(stripeAccountId: string, userId: string): Promise<string> {
    const link = await this.stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.APP_URL}/stripe/onboarding/refresh?userId=${userId}`,
      return_url:  `${process.env.APP_URL}/stripe/onboarding/complete?userId=${userId}`,
      type: 'account_onboarding',
    })
    return link.url
  }

  async getAccountStatus(stripeAccountId: string) {
    const account = await this.stripe.accounts.retrieve(stripeAccountId)
    return {
      chargesEnabled:  account.charges_enabled,
      payoutsEnabled:  account.payouts_enabled,
      requiresAction: !account.details_submitted,
    }
  }

  // ─── PAYMENT INTENT ────────────────────────────────────────────────────

  async createPaymentIntent(params: {
    amountCents: number
    platformFeeCents: number
    stripeCustomerId: string
    method: 'pix' | 'card' | 'boleto'
    coletaId: string
    trackingCode: string
  }): Promise<Stripe.PaymentIntent> {
    const methodTypes: Record<string, string[]> = {
      pix:    ['pix'],
      card:   ['card'],
      boleto: ['boleto'],
    }

    return this.stripe.paymentIntents.create({
      amount:   params.amountCents,
      currency: 'brl',
      customer: params.stripeCustomerId,
      payment_method_types: methodTypes[params.method],
      application_fee_amount: params.platformFeeCents,
      metadata: {
        coleta_id:      params.coletaId,
        tracking_code:  params.trackingCode,
      },
      ...(params.method === 'pix' && {
        payment_method_options: {
          pix: { expires_after_seconds: 600 },  // 10 min
        },
      }),
      ...(params.method === 'boleto' && {
        payment_method_options: {
          boleto: { expires_after_days: 3 },
        },
      }),
    })
  }

  async getPaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(id)
  }

  // ─── TRANSFER → MOTOBOY ────────────────────────────────────────────────

  async transferToConnectedAccount(params: {
    amountCents: number
    stripeAccountId: string
    coletaId: string
    chargeId: string
  }): Promise<string> {
    const transfer = await this.stripe.transfers.create({
      amount:             params.amountCents,
      currency:           'brl',
      destination:        params.stripeAccountId,
      source_transaction: params.chargeId,
      metadata: {
        coleta_id: params.coletaId,
        type:      'repasse_motoboy',
      },
    })
    return transfer.id
  }

  // ─── PAYOUT INSTANTÂNEO ────────────────────────────────────────────────

  async createInstantPayout(params: {
    amountCents: number
    stripeAccountId: string
  }): Promise<string> {
    const payout = await this.stripe.payouts.create(
      {
        amount:   params.amountCents,
        currency: 'brl',
        method:   'instant',
      },
      { stripeAccount: params.stripeAccountId },
    )
    return payout.id
  }

  // ─── BALANCE DA CONTA CONECTADA ────────────────────────────────────────

  async getConnectedBalance(stripeAccountId: string) {
    const balance = await this.stripe.balance.retrieve({
      stripeAccount: stripeAccountId,
    })
    const brl = balance.available.find((b) => b.currency === 'brl')
    const pending = balance.pending.find((b) => b.currency === 'brl')
    return {
      available: brl?.amount ?? 0,
      pending:   pending?.amount ?? 0,
    }
  }

  // ─── PLATAFORMA ────────────────────────────────────────────────────────

  async getPlatformBalance() {
    const balance = await this.stripe.balance.retrieve()
    const brl = balance.available.find((b) => b.currency === 'brl')
    const pending = balance.pending.find((b) => b.currency === 'brl')
    return {
      available: brl?.amount ?? 0,
      pending:   pending?.amount ?? 0,
    }
  }

  // ─── WEBHOOK ───────────────────────────────────────────────────────────

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  }
}
