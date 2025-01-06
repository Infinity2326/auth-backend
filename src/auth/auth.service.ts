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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}
  public async register(req: Request, registerDto: RegisterDto) {
    const isExsist = await this.userService.findByEmail(registerDto.email)
    if (isExsist) {
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
    return this.saveSession(req, newUser)
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

    return this.saveSession(req, user)
  }

  public async logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException('Session destroy error'),
          )
        }
        res.clearCookie(this.configService.getOrThrow('SESSION_NAME'))
        resolve()
      })
    })
  }

  private async saveSession(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id
      req.session.save((err) => {
        if (err) {
          return reject(new InternalServerErrorException('Session save error'))
        }
      })

      return resolve(user)
    })
  }
}
