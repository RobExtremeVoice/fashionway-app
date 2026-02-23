import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Role, User } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../common/prisma/prisma.service'
import { LoginDto, RegisterDto } from './dto/auth.dto'

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ─── REGISTRO ────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    })

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'E-mail já cadastrado'
          : 'Telefone já cadastrado',
      )
    }

    // Apenas roles válidas para auto-cadastro (Admin não pode se auto-registrar)
    const allowedRoles: Role[] = ['LOJA', 'FABRICA', 'INTERMEDIARIO', 'MOTOBOY', 'TRANSPORTADORA']
    if (!allowedRoles.includes(dto.role)) {
      throw new BadRequestException('Role inválida para registro')
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: dto.role,
        status: 'PENDING_VERIFICATION',
        // Cria perfil específico por role
        ...(dto.role === 'LOJA' && {
          lojaProfile: { create: { nomeEmpresa: dto.name, companyType: 'LOJA' } },
        }),
        ...(dto.role === 'FABRICA' && {
          lojaProfile: { create: { nomeEmpresa: dto.name, companyType: 'FABRICA' } },
        }),
        ...(dto.role === 'MOTOBOY' && {
          motoboyProfile: {
            create: {
              nomeCompleto: dto.name,
              cpf: '',
              dataNascimento: new Date('2000-01-01'),
              tipoVeiculo: 'moto',
              cidadeAtuacao: '',
              estadoAtuacao: '',
            },
          },
        }),
        ...(dto.role === 'INTERMEDIARIO' && {
          intermediarioProfile: { create: { nomeEmpresa: dto.name } },
        }),
        ...(dto.role === 'TRANSPORTADORA' && {
          transportadoraProfile: { create: { nomeEmpresa: dto.name } },
        }),
      },
    })

    return this.generateTokens(user)
  }

  // ─── LOGIN ───────────────────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) throw new UnauthorizedException('Credenciais inválidas')
    if (user.status === 'SUSPENDED') throw new UnauthorizedException('Conta suspensa')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Credenciais inválidas')

    // Atualiza status para ACTIVE no primeiro login
    if (user.status === 'PENDING_VERIFICATION') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: 'ACTIVE' },
      })
    }

    return this.generateTokens(user)
  }

  // ─── REFRESH TOKEN ───────────────────────────────────────────────────────

  async refresh(user: User): Promise<TokenPair> {
    return this.generateTokens(user)
  }

  // ─── LOGOUT ──────────────────────────────────────────────────────────────

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId, token: refreshToken },
    })
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  private async generateTokens(user: Pick<User, 'id' | 'email' | 'role'>): Promise<TokenPair> {
    const payload = { sub: user.id, email: user.email, role: user.role }

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    })

    // Persiste refresh token
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    })

    return { accessToken, refreshToken }
  }
}
