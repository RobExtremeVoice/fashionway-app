export type PaymentStatus =
  | 'PENDENTE'
  | 'PROCESSANDO'
  | 'CONFIRMADO'
  | 'FALHOU'
  | 'REEMBOLSADO'
  | 'EXPIRADO'

export type PayoutStatus = 'PENDENTE' | 'PROCESSANDO' | 'PAGO' | 'FALHOU'

export interface Payment {
  id: string
  coletaId: string
  amount: number          // centavos BRL
  currency: string
  method: string
  status: PaymentStatus
  stripePaymentIntentId: string
  pixQrCode?: string
  pixCopyPaste?: string
  pixExpiresAt?: string
  boletoUrl?: string
  paidAt?: string
  createdAt: string
}

export interface Payout {
  id: string
  userId: string
  amount: number          // centavos BRL
  status: PayoutStatus
  stripeTransferId?: string
  processedAt?: string
  createdAt: string
}

export interface CreatePaymentDto {
  coletaId: string
  method: 'pix' | 'card' | 'boleto'
}

export interface PixStatusResponse {
  paid: boolean
  status: string
  expiresAt: string
}
