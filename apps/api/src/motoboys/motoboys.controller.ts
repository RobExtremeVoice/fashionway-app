import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { MotoboysService } from './motoboys.service'
import { UpdateMotoboyStatusDto } from './dto/update-status.dto'

interface AuthUser {
  id: string
  role: string
}

@Controller('motoboys')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MOTOBOY')
export class MotoboysController {
  constructor(private readonly motoboysService: MotoboysService) {}

  @Get('me')
  findMe(@CurrentUser() user: AuthUser) {
    return this.motoboysService.findMe(user.id)
  }

  @Patch('status')
  updateStatus(@CurrentUser() user: AuthUser, @Body() dto: UpdateMotoboyStatusDto) {
    return this.motoboysService.updateStatus(user.id, dto)
  }
}
