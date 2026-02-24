import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        lojaProfile: {
          select: { nomeEmpresa: true, cnpj: true, companyType: true },
        },
        motoboyProfile: {
          select: {
            nomeCompleto: true,
            cpf: true,
            tipoVeiculo: true,
            cidadeAtuacao: true,
            estadoAtuacao: true,
            onlineStatus: true,
            ratingMedia: true,
          },
        },
        intermediarioProfile: {
          select: { nomeEmpresa: true, cnpj: true },
        },
        transportadoraProfile: {
          select: { nomeEmpresa: true, cnpj: true },
        },
      },
    })

    if (!user) throw new NotFoundException('Usuário não encontrado')

    return user
  }
}
