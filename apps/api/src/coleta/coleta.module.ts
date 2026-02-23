import { Module } from '@nestjs/common'
import { ColetaService } from './coleta.service'
import { ColetaController } from './coleta.controller'
import { PricingModule } from '../pricing/pricing.module'

@Module({
  imports: [PricingModule],
  providers: [ColetaService],
  controllers: [ColetaController],
  exports: [ColetaService],
})
export class ColetaModule {}
