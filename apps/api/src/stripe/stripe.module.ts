import { Module } from '@nestjs/common'
import { StripeService } from './stripe.service'
import { StripeWebhookController } from './stripe-webhook.controller'
import { ColetaModule } from '../coleta/coleta.module'

@Module({
  imports: [ColetaModule],
  providers: [StripeService],
  controllers: [StripeWebhookController],
  exports: [StripeService],
})
export class StripeModule {}
