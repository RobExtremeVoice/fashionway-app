import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { PrismaService } from '../../common/prisma/prisma.service'
import { JwtPayload } from './jwt.strategy'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.body?.refreshToken as string

    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado')
    }

    return stored.user
  }
}
