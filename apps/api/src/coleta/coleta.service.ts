import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { ColetaStatus, Role, ServiceTier } from '@prisma/client'
import { PrismaService } from '../common/prisma/prisma.service'
import { PricingService } from '../pricing/pricing.service'
import { generateTrackingCode } from '@fashionway/shared'
import { CreateColetaDto, QuoteColetaDto } from './dto/create-coleta.dto'

interface CurrentUser {
  id: string
  role: Role
}

// Transições de status permitidas por role
const STATUS_TRANSITIONS: Record<ColetaStatus, ColetaStatus[]> = {
  NOVA:          ['PENDENTE', 'CANCELADA'],
  PENDENTE:      ['ACEITA', 'CANCELADA'],
  ACEITA:        ['EM_ROTA_COLETA', 'CANCELADA'],
  EM_ROTA_COLETA:['COLETADO'],
  COLETADO:      ['EM_TRANSITO'],
  EM_TRANSITO:   ['ENTREGUE'],
  ENTREGUE:      ['DISPUTA'],
  CANCELADA:     [],
  DISPUTA:       [],
}

@Injectable()
export class ColetaService {
  constructor(
    private prisma: PrismaService,
    private pricing: PricingService,
  ) {}

  // ─── COTAÇÃO (antes de criar) ─────────────────────────────────────────

  async quote(dto: QuoteColetaDto) {
    const distanciaKm = this.pricing.haversineKm(
      dto.originLat, dto.originLng,
      dto.destinationLat, dto.destinationLng,
    )
    return this.pricing.quote(distanciaKm)
  }

  // ─── CRIAR COLETA ─────────────────────────────────────────────────────

  async create(dto: CreateColetaDto, user: CurrentUser) {
    // Resolve endereço de origem
    const originAddressId = await this.resolveAddress(dto, 'origin', user.id)
    const destinationAddressId = await this.resolveAddress(dto, 'destination', user.id)

    // Busca coordenadas para calcular distância
    const [origin, destination] = await Promise.all([
      this.prisma.address.findUniqueOrThrow({ where: { id: originAddressId } }),
      this.prisma.address.findUniqueOrThrow({ where: { id: destinationAddressId } }),
    ])

    const distanciaKm = this.pricing.haversineKm(
      origin.lat, origin.lng,
      destination.lat, destination.lng,
    )

    const { valorFrete, valorRepasse, taxaPlataforma } =
      this.pricing.calculate({ distanciaKm, serviceTier: dto.serviceTier as ServiceTier })

    // Validação de Agendado
    if (dto.serviceTier === 'AGENDADO' && !dto.scheduledAt) {
      throw new BadRequestException('Data de agendamento obrigatória para Coleta Agendada')
    }

    const coleta = await this.prisma.coleta.create({
      data: {
        trackingCode: generateTrackingCode(),
        // Associa pelo role do usuário logado
        ...(user.role === 'LOJA' || user.role === 'FABRICA'
          ? { lojaId: user.id }
          : {}),
        ...(user.role === 'INTERMEDIARIO'
          ? { intermediarioId: user.id, vipMotoboyId: dto.vipMotoboyId }
          : {}),
        originAddressId,
        destinationAddressId,
        serviceTier: dto.serviceTier as ServiceTier,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        status: 'NOVA',
        valorFrete,
        valorRepasse,
        taxaPlataforma,
        distanciaKm,
        quantidadeItens: dto.quantidadeItens,
        pesoTotalKg: dto.pesoTotalKg,
        paymentMethod: dto.paymentMethod as any,
        // Histórico inicial
        statusHistory: {
          create: { status: 'NOVA', changedBy: user.id },
        },
      },
      include: {
        originAddress: true,
        destinationAddress: true,
      },
    })

    return coleta
  }

  // ─── ATUALIZAR STATUS ─────────────────────────────────────────────────

  async updateStatus(
    coletaId: string,
    newStatus: ColetaStatus,
    user: CurrentUser,
    note?: string,
    photoUrl?: string,
  ) {
    const coleta = await this.prisma.coleta.findUniqueOrThrow({
      where: { id: coletaId },
    })

    // Valida transição
    const allowed = STATUS_TRANSITIONS[coleta.status]
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transição inválida: ${coleta.status} → ${newStatus}`,
      )
    }

    // Valida permissão por role
    this.checkStatusPermission(user.role, newStatus, coleta, user.id)

    const timestamps: Record<string, Date> = {}
    if (newStatus === 'ACEITA')       timestamps.acceptedAt = new Date()
    if (newStatus === 'COLETADO')     timestamps.pickedUpAt = new Date()
    if (newStatus === 'ENTREGUE')     timestamps.deliveredAt = new Date()
    if (newStatus === 'CANCELADA')    timestamps.cancelledAt = new Date()

    const updated = await this.prisma.coleta.update({
      where: { id: coletaId },
      data: {
        status: newStatus,
        ...timestamps,
        ...(newStatus === 'ACEITA' && user.role === 'MOTOBOY'
          ? { motoboyId: user.id }
          : {}),
        ...(photoUrl && newStatus === 'COLETADO'
          ? { pickupPhotoUrl: photoUrl }
          : {}),
        ...(photoUrl && newStatus === 'ENTREGUE'
          ? { deliveryPhotoUrl: photoUrl }
          : {}),
        statusHistory: {
          create: { status: newStatus, changedBy: user.id, note },
        },
      },
      include: {
        originAddress: true,
        destinationAddress: true,
        motoboy: { select: { id: true, phone: true, motoboyProfile: true } },
      },
    })

    return updated
  }

  // ─── LISTAR (por role) ─────────────────────────────────────────────────

  async findAll(user: CurrentUser, filters: {
    status?: ColetaStatus
    page?: number
    limit?: number
  }) {
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const skip = (page - 1) * limit

    const where = this.buildWhereClause(user, filters.status)

    const [items, total] = await Promise.all([
      this.prisma.coleta.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          originAddress: true,
          destinationAddress: true,
          motoboy: { select: { id: true, motoboyProfile: { select: { nomeCompleto: true } } } },
        },
      }),
      this.prisma.coleta.count({ where }),
    ])

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string, user: CurrentUser) {
    const coleta = await this.prisma.coleta.findUniqueOrThrow({
      where: { id },
      include: {
        originAddress: true,
        destinationAddress: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        payment: true,
        review: true,
        motoboy: {
          select: {
            id: true,
            phone: true,
            motoboyProfile: {
              select: {
                nomeCompleto: true,
                ratingMedia: true,
                tipoVeiculo: true,
                lastLocationLat: true,
                lastLocationLng: true,
              },
            },
          },
        },
      },
    })

    // Verifica se usuário tem acesso a esta coleta
    this.checkReadPermission(user, coleta)

    return coleta
  }

  // ─── CHAT / MENSAGENS ─────────────────────────────────────────────────

  async getMessages(coletaId: string, user: CurrentUser) {
    const coleta = await this.prisma.coleta.findUniqueOrThrow({ where: { id: coletaId } })
    this.checkReadPermission(user, coleta)
    return this.prisma.message.findMany({
      where: { coletaId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, role: true } } },
    })
  }

  async sendMessage(coletaId: string, user: CurrentUser, text: string) {
    if (!text?.trim()) throw new BadRequestException('Mensagem não pode ser vazia')
    const coleta = await this.prisma.coleta.findUniqueOrThrow({ where: { id: coletaId } })
    this.checkReadPermission(user, coleta)
    return this.prisma.message.create({
      data: { coletaId, senderId: user.id, text: text.trim() },
      include: { sender: { select: { id: true, role: true } } },
    })
  }

  // ─── MOTOBOYS DISPONÍVEIS (para Admin/Intermediário) ──────────────────

  async findAvailableMotoboys(coletaId: string) {
    const coleta = await this.prisma.coleta.findUniqueOrThrow({
      where: { id: coletaId },
      include: { originAddress: true },
    })

    // Busca motoboys online e próximos (raio ~10km simples)
    const motoboys = await this.prisma.user.findMany({
      where: {
        role: 'MOTOBOY',
        status: 'ACTIVE',
        motoboyProfile: {
          onlineStatus: true,
          lastLocationLat: { not: null },
          lastLocationLng: { not: null },
        },
      },
      select: {
        id: true,
        motoboyProfile: {
          select: {
            nomeCompleto: true,
            ratingMedia: true,
            tipoVeiculo: true,
            lastLocationLat: true,
            lastLocationLng: true,
          },
        },
      },
    })

    // Calcula distância de cada motoboy até a origem
    return motoboys
      .map((m) => ({
        ...m,
        distanciaKm: this.pricing.haversineKm(
          m.motoboyProfile!.lastLocationLat!,
          m.motoboyProfile!.lastLocationLng!,
          coleta.originAddress.lat,
          coleta.originAddress.lng,
        ),
      }))
      .filter((m) => m.distanciaKm <= 15)
      .sort((a, b) => a.distanciaKm - b.distanciaKm)
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────

  private async resolveAddress(
    dto: CreateColetaDto,
    side: 'origin' | 'destination',
    userId: string,
  ): Promise<string> {
    const idKey = `${side}AddressId` as const
    const dataKey = `${side}Address` as const

    if (dto[idKey]) {
      // Verifica que o endereço pertence ao usuário
      const addr = await this.prisma.address.findFirst({
        where: { id: dto[idKey]!, userId },
      })
      if (!addr) throw new NotFoundException(`Endereço de ${side} não encontrado`)
      return addr.id
    }

    if (dto[dataKey]) {
      const addr = await this.prisma.address.create({
        data: { ...dto[dataKey]!, userId },
      })
      return addr.id
    }

    throw new BadRequestException(`Endereço de ${side} obrigatório`)
  }

  private buildWhereClause(user: CurrentUser, status?: ColetaStatus) {
    const statusFilter = status ? { status } : {}

    switch (user.role) {
      case 'LOJA':
      case 'FABRICA':
        return { lojaId: user.id, ...statusFilter }
      case 'INTERMEDIARIO':
        return { intermediarioId: user.id, ...statusFilter }
      case 'MOTOBOY':
        return {
          OR: [
            { motoboyId: user.id },
            // Novas coletas disponíveis para aceitar
            { status: 'NOVA' as ColetaStatus, motoboyId: null },
          ],
          ...statusFilter,
        }
      case 'ADMIN':
        return statusFilter
      default:
        return { id: 'never' }
    }
  }

  private checkReadPermission(user: CurrentUser, coleta: any) {
    if (user.role === 'ADMIN') return

    const isOwner =
      coleta.lojaId === user.id ||
      coleta.intermediarioId === user.id ||
      coleta.motoboyId === user.id

    if (!isOwner) throw new ForbiddenException('Acesso negado')
  }

  private checkStatusPermission(
    role: Role,
    newStatus: ColetaStatus,
    coleta: any,
    userId: string,
  ) {
    const motoboyStatuses: ColetaStatus[] = [
      'ACEITA', 'EM_ROTA_COLETA', 'COLETADO', 'EM_TRANSITO', 'ENTREGUE',
    ]
    const clientStatuses: ColetaStatus[] = ['CANCELADA']
    const adminStatuses: ColetaStatus[] = Object.keys(STATUS_TRANSITIONS) as ColetaStatus[]

    if (role === 'MOTOBOY' && !motoboyStatuses.includes(newStatus)) {
      throw new ForbiddenException('Motoboy não pode executar esta ação')
    }

    if (
      (role === 'LOJA' || role === 'FABRICA' || role === 'INTERMEDIARIO') &&
      !clientStatuses.includes(newStatus)
    ) {
      throw new ForbiddenException('Cliente não pode executar esta ação')
    }

    // Motoboy só pode aceitar coleta sem motoboy ou que já é sua
    if (newStatus === 'ACEITA' && role === 'MOTOBOY') {
      if (coleta.motoboyId && coleta.motoboyId !== userId) {
        throw new ForbiddenException('Coleta já atribuída a outro motoboy')
      }
    }
  }
}
