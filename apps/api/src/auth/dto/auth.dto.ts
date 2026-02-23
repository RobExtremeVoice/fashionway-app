import { IsEmail, IsEnum, IsString, MinLength, IsMobilePhone } from 'class-validator'
import { Role } from '@prisma/client'

export class LoginDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string
}

export class RegisterDto {
  @IsEmail()
  email: string

  @IsMobilePhone('pt-BR')
  phone: string

  @IsString()
  @MinLength(6)
  password: string

  @IsEnum(Role)
  role: Role

  @IsString()
  @MinLength(2)
  name: string
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string
}
