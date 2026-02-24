import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { PaymentsService } from './payments.service'
import { CreatePaymentDto } from './dto/create-payment.dto'

interface AuthUser {
  id: string
  role: Role
}

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(user, dto)
  }

  @Get('pix/:paymentIntentId')
  getPix(@CurrentUser() user: AuthUser, @Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.getPix(user, paymentIntentId)
  }

  @Get('status/:paymentIntentId')
  getStatus(@CurrentUser() user: AuthUser, @Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.getStatus(user, paymentIntentId)
  }
}
