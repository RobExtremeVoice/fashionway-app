import { Body, Controller, Post, UseGuards, HttpCode } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto'
import { CurrentUser } from './decorators/current-user.decorator'
import { Public } from './decorators/public.decorator'
import { User } from '@prisma/client'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('refresh')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt-refresh'))
  refresh(@CurrentUser() user: User) {
    return this.authService.refresh(user)
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  logout(
    @CurrentUser() user: User,
    @Body() dto: RefreshTokenDto,
  ) {
    return this.authService.logout(user.id, dto.refreshToken)
  }
}
