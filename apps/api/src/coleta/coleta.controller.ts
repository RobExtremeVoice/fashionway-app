import {
  Controller, Get, Post, Patch, Body,
  Param, Query, UseGuards, ParseEnumPipe,
} from '@nestjs/common'
import { ColetaStatus, Role } from '@prisma/client'
import { ColetaService } from './coleta.service'
import { CreateColetaDto, QuoteColetaDto, UpdateStatusDto } from './dto/create-coleta.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

interface AuthUser { id: string; role: Role }

@Controller('coletas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ColetaController {
  constructor(private readonly coletaService: ColetaService) {}

  // Cotação de preços antes de criar
  @Post('quote')
  @Roles('LOJA', 'FABRICA', 'INTERMEDIARIO', 'ADMIN')
  quote(@Body() dto: QuoteColetaDto) {
    return this.coletaService.quote(dto)
  }

  // Criar coleta
  @Post()
  @Roles('LOJA', 'FABRICA', 'INTERMEDIARIO')
  create(@Body() dto: CreateColetaDto, @CurrentUser() user: AuthUser) {
    return this.coletaService.create(dto, user)
  }

  // Listar coletas (filtrado por role automaticamente)
  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: ColetaStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.coletaService.findAll(user, {
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    })
  }

  // Detalhe de uma coleta
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.coletaService.findOne(id, user)
  }

  // Atualizar status (motoboy aceita, coleta, entrega)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.coletaService.updateStatus(
      id,
      dto.status as ColetaStatus,
      user,
      dto.note,
      dto.photoUrl,
    )
  }

  // Motoboys disponíveis para uma coleta (Admin/Intermediário)
  @Get(':id/motoboys-disponiveis')
  @Roles('ADMIN', 'INTERMEDIARIO')
  findAvailableMotoboys(@Param('id') id: string) {
    return this.coletaService.findAvailableMotoboys(id)
  }
}
