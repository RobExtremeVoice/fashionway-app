import { Controller, Get } from '@nestjs/common'
import { UsersService } from './users.service'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: { id: string }) {
    return this.usersService.findMe(user.id)
  }
}
