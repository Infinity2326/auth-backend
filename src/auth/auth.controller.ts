import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { Request, Response } from 'express'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(@Req() req: Request, @Body() dto: RegisterDto) {
    return await this.authService.register(req, dto)
  }

  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  public async login(@Req() req: Request, @Body() dto: LoginDto) {
    return await this.authService.login(req, dto)
  }

  @Post('logout')
  @HttpCode(HttpStatus.CREATED)
  public async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.logout(req, res)
  }
}
