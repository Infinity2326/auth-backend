import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { Request, Response } from 'express'
import { LoginDto } from './dto/login.dto'
import { Recaptcha } from '@nestlab/google-recaptcha'
import { AuthProviderGuard } from './guards/provider.guard'
import { ConfigService } from '@nestjs/config'
import { ProviderService } from './provider/provider.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService,
  ) {}

  @Recaptcha()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(@Req() req: Request, @Body() dto: RegisterDto) {
    return await this.authService.register(req, dto)
  }

  @Recaptcha()
  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  public async login(@Req() req: Request, @Body() dto: LoginDto) {
    return await this.authService.login(req, dto)
  }

  @UseGuards(AuthProviderGuard)
  @Get('/oauth/callback/:provider')
  @HttpCode(HttpStatus.OK)
  public async callback(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Param('provider') provider: string,
    @Query('code') code: string,
  ) {
    if (!code) {
      throw new BadRequestException('Code is required')
    }

    await this.authService.extractProfileFromCode(request, provider, code)

    return response.redirect(
      `${this.configService.getOrThrow('ALLOWED_ORIGIN')}/dashboard/settings`,
    )
  }

  @UseGuards(AuthProviderGuard)
  @Get('/oauth/connect/:provider')
  @HttpCode(HttpStatus.OK)
  public async connect(@Param('provider') provider: string) {
    const providerInstance = this.providerService.findByService(provider)
    return { url: providerInstance.getAuthUrl() }
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
