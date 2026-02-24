import { Module } from '@nestjs/common'
import { AddressesController } from './addresses.controller'
import { AddressesService } from './addresses.service'
import { ViaCepService } from '../common/viacep/viacep.service'

@Module({
  controllers: [AddressesController],
  providers: [AddressesService, ViaCepService],
})
export class AddressesModule {}
