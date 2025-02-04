import { ConfigService } from '@nestjs/config'
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { RegisterDto } from './dto/register.dto'
import { UserService } from '../user/user.service'
import { AuthMethod } from '../../prisma/__generated__'
import { Request, Response } from 'express'
import { User } from './types/auth.types'
import { LoginDto } from './dto/login.dto'
import { verify } from 'argon2'
import { ProviderService } from './provider/provider.service'
import { PrismaService } from '../prisma/prisma.service'
import { EmailConfirmationService } from './email-confirmation/email-confirmation.service'
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service'

@Injectable()
export class AuthService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService,
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  public async register(req: Request, registerDto: RegisterDto) {
    const isExist = await this.userService.findByEmail(registerDto.email)
    if (isExist) {
      throw new ConflictException('Email already exists')
    }

    const { passwordRepeat, ...data } = registerDto
    if (passwordRepeat !== data.password) {
      throw new ConflictException('Passwords do not match')
    }

    const newUser = await this.userService.create({
      ...data,
      method: AuthMethod.CREDENTIAL,
    })

    await this.emailConfirmationService.sendVerificationToken(newUser.id)

    return { message: 'Successful registration. Please confirm your email.' }
  }

  public async login(req: Request, loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email)
    if (!user || !user.password) {
      throw new NotFoundException('User not found')
    }

    const isValidPassword = await verify(user.password, loginDto.password)
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password')
    }

    if (!user.isVerifed) {
      await this.emailConfirmationService.sendVerificationToken(user.id)
      throw new UnauthorizedException('Please confirm your email.')
    }

    if (user.isTwoFactorEnabled) {
      if (!loginDto.code) {
        await this.twoFactorAuthService.sendTwoFactorToken(user.id)

        return {
          message: 'Check email for verification code.',
        }
      }

      await this.twoFactorAuthService.validateTwoFactorToken(
        user.email,
        loginDto.code,
      )
    }

    return this.saveSession(req, user)
  }

  public async extractProfileFromCode(
    request: Request,
    provider: string,
    code: string,
  ) {
    const providerInstance = this.providerService.findByService(provider)
    const profile = await providerInstance.findUserByCode(code)

    const account = await this.prisma.account.findFirst({
      where: { id: profile.id, provider: provider },
    })

    const existingUser = account?.userId
      ? await this.userService.findById(account.userId)
      : null

    if (existingUser) {
      return this.saveSession(request, existingUser)
    }

    const newUser = await this.userService.create({
      id: profile.id,
      email: profile.email,
      password: '',
      displayName: profile.name,
      picture: profile.picture,
      method: AuthMethod[profile.provider.toUpperCase()],
      isVerifed: true,
    })

    if (!account) {
      await this.prisma.account.create({
        data: {
          userId: newUser.id,
          type: 'oauth',
          provider: profile.provider,
          accessToken: profile.access_token,
          refreshToken: profile.refresh_token,
          expiresAt: profile.expires_at,
        },
      })
    }

    return this.saveSession(request, newUser)
  }

  public async logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException('Session destroy error'),
          )
        }
        res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))
        resolve()
      })
    })
  }

  public async saveSession(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id
      req.session.save((err) => {
        if (err) {
          return reject(new InternalServerErrorException('Session save error'))
        }
        resolve({
          user,
        })
      })
    })
  }
}
