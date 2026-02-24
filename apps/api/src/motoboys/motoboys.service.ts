import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import { UpdateMotoboyStatusDto } from './dto/update-status.dto'

@Injectable()
export class MotoboysService {
  constructor(private readonly prisma: PrismaService) {}

  async findMe(userId: string) {
    const profile = await this.prisma.motoboyProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        nomeCompleto: true,
        tipoVeiculo: true,
        cidadeAtuacao: true,
        estadoAtuacao: true,
        onlineStatus: true,
        ratingMedia: true,
        totalColetas: true,
        lastLocationLat: true,
        lastLocationLng: true,
        lastLocationAt: true,
      },
    })

    if (!profile) throw new NotFoundException('Perfil de motoboy não encontrado')

    return profile
  }

  async updateStatus(userId: string, dto: UpdateMotoboyStatusDto) {
    const profile = await this.prisma.motoboyProfile.findUnique({ where: { userId } })
    if (!profile) throw new NotFoundException('Perfil de motoboy não encontrado')

    return this.prisma.motoboyProfile.update({
      where: { userId },
      data: {
        onlineStatus: dto.online,
        ...(typeof dto.lat === 'number' ? { lastLocationLat: dto.lat } : {}),
        ...(typeof dto.lng === 'number' ? { lastLocationLng: dto.lng } : {}),
        ...(typeof dto.lat === 'number' || typeof dto.lng === 'number' ? { lastLocationAt: new Date() } : {}),
      },
      select: {
        onlineStatus: true,
        lastLocationLat: true,
        lastLocationLng: true,
        lastLocationAt: true,
      },
    })
  }
}
