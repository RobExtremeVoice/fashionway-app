import { Controller, Get, Post, Param, Body } from '@nestjs/common'
import { AddressesService } from './addresses.service'
import { Public } from '../auth/decorators/public.decorator'

class GeocodeDto {
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

@Controller('addresses')
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  // Público — mobile chama antes do login (tela de registro com CEP também)
  @Public()
  @Get('cep/:cep')
  lookupCep(@Param('cep') cep: string) {
    return this.addressesService.lookupCep(cep)
  }

  @Post('geocode')
  geocode(@Body() dto: GeocodeDto) {
    return this.addressesService.geocode(dto)
  }
}
