import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { RegisterDto } from './dto/register.dto'
import { UserService } from '../user/user.service'
import { AuthMethod } from '../../prisma/__generated__'
import { Request } from 'express'
import { User } from './types/auth.types'

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
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

  public async login() {}

  public async logout() {}

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
