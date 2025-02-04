import { MailService } from './../../libs/mail/mail.service'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { TokenType } from '../../../prisma/__generated__'
import { UserService } from '../../user/user.service'

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
  ) {}

  private async generateTwoFactorToken(userId: string) {
    const token = Math.floor(
      Math.random() * (1000000 - 100000) + 100000,
    ).toString()
    const expiresIn = new Date(new Date().getTime() + 15 * 60 * 1000)
    const user = await this.userService.findById(userId)

    const existingToken = await this.prisma.token.findFirst({
      where: { email: user.email, type: TokenType.TWO_FACTOR },
    })

    if (existingToken) {
      await this.prisma.token.delete({
        where: {
          id: existingToken.id,
        },
      })
    }

    const twoFactorToken = await this.prisma.token.create({
      data: {
        email: user.email,
        token,
        expiresIn,
        type: TokenType.TWO_FACTOR,
      },
    })

    return twoFactorToken
  }

  public async validateTwoFactorToken(email: string, code: string) {
    const existingToken = await this.prisma.token.findFirst({
      where: { email, type: TokenType.TWO_FACTOR },
    })

    if (!existingToken) {
      throw new NotFoundException('Token not found')
    }

    if (existingToken.token !== code) {
      throw new BadRequestException('Invalid code')
    }

    const hasExpired = new Date(existingToken.expiresIn) < new Date()

    if (hasExpired) {
      throw new BadRequestException('Token expired')
    }

    await this.prisma.token.delete({
      where: {
        id: existingToken.id,
      },
    })

    return true
  }

  public async sendTwoFactorToken(userId: string) {
    const twoFactorToken = await this.generateTwoFactorToken(userId)

    await this.mailService.sendTwoFactorTokenEmail(
      twoFactorToken.email,
      twoFactorToken.token,
    )

    return true
  }
}
