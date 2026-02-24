import { IsEmail, IsIn, IsString, MinLength, IsMobilePhone } from 'class-validator'
import type { Role } from '@fashionway/shared'

export class LoginDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string
}

const VALID_ROLES = ['LOJA', 'INTERMEDIARIO', 'MOTOBOY', 'TRANSPORTADORA', 'FABRICA', 'ADMIN']

export class RegisterDto {
  @IsEmail()
  email: string

  @IsMobilePhone('pt-BR')
  phone: string

  @IsString()
  @MinLength(6)
  password: string

  @IsIn(VALID_ROLES)
  role: Role

  @IsString()
  @MinLength(2)
  name: string
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string
}
