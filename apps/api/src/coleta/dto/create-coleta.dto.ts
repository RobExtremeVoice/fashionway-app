import {
  IsEnum, IsString, IsOptional, IsNumber,
  IsDateString, ValidateNested, IsNotEmpty,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ServiceTier, PaymentMethod } from '@prisma/client'

export class AddressInputDto {
  @IsString()
  cep: string

  @IsString()
  logradouro: string

  @IsString()
  numero: string

  @IsOptional()
  @IsString()
  complemento?: string

  @IsString()
  bairro: string

  @IsString()
  cidade: string

  @IsString()
  estado: string

  @IsNumber()
  lat: number

  @IsNumber()
  lng: number

  @IsOptional()
  @IsString()
  label?: string

  @IsOptional()
  @IsString()
  pessoaContato?: string

  @IsOptional()
  @IsString()
  telefoneContato?: string
}

export class CreateColetaDto {
  // Origem: ID de endereço salvo OU endereço novo
  @IsOptional()
  @IsString()
  originAddressId?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressInputDto)
  originAddress?: AddressInputDto

  // Destino: ID de endereço salvo OU endereço novo
  @IsOptional()
  @IsString()
  destinationAddressId?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressInputDto)
  destinationAddress?: AddressInputDto

  @IsEnum(ServiceTier)
  serviceTier: ServiceTier

  @IsOptional()
  @IsDateString()
  scheduledAt?: string    // apenas para AGENDADO

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @IsOptional()
  @IsNumber()
  quantidadeItens?: number

  @IsOptional()
  @IsNumber()
  pesoTotalKg?: number

  // Apenas Intermediário
  @IsOptional()
  @IsString()
  vipMotoboyId?: string
}

export class QuoteColetaDto {
  @IsNumber()
  originLat: number

  @IsNumber()
  originLng: number

  @IsNumber()
  destinationLat: number

  @IsNumber()
  destinationLng: number
}

export class UpdateStatusDto {
  @IsNotEmpty()
  status: string

  @IsOptional()
  @IsString()
  note?: string

  @IsOptional()
  @IsString()
  photoUrl?: string
}
