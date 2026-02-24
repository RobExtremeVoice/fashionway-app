import { IsBoolean, IsNumber, IsOptional } from 'class-validator'

export class UpdateMotoboyStatusDto {
  @IsBoolean()
  online: boolean

  @IsOptional()
  @IsNumber()
  lat?: number

  @IsOptional()
  @IsNumber()
  lng?: number
}
