export type Role =
  | 'ADMIN'
  | 'LOJA'
  | 'FABRICA'
  | 'INTERMEDIARIO'
  | 'MOTOBOY'
  | 'TRANSPORTADORA'

export type UserStatus =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'

export interface User {
  id: string
  email: string
  phone: string
  role: Role
  status: UserStatus
  profilePhoto?: string
  stripeCustomerId?: string
  stripeAccountId?: string
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  phone: string
  password: string
  role: Role
  name: string
}
