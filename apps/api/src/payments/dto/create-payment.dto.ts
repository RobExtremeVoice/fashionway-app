import { IsIn, IsString } from 'class-validator'

const PAYMENT_METHODS = ['pix', 'card', 'boleto'] as const

export class CreatePaymentDto {
  @IsString()
  coletaId: string

  @IsIn(PAYMENT_METHODS)
  method: (typeof PAYMENT_METHODS)[number]
}
