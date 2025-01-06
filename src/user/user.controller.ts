import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common'
import { UserService } from './user.service'
import { Authorized } from '../auth/decorators/authorized.decorator'
import { Authorization } from '../auth/decorators/auth.decorator'
import { UserRole } from '../../prisma/__generated__'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  public async findProfile(@Authorized('id') userId: string) {
    return await this.userService.findById(userId)
  }

  @Authorization(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get('by-id/:id')
  public async findById(@Param('id') userId: string) {
    return await this.userService.findById(userId)
  }
}
