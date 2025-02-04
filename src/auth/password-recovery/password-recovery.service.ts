import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { UserService } from '../../user/user.service'
import { MailService } from '../../libs/mail/mail.service'
import { v4 } from 'uuid'
import { TokenType } from '../../../prisma/__generated__'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { NewPasswordDto } from './dto/new-password.dto'
import { hash } from 'argon2'

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  public async resetPassword(data: ResetPasswordDto) {
    const existingUser = await this.userService.findByEmail(data.email)

    if (!existingUser) {
      throw new NotFoundException('User not found')
    }

    const passwordResetToken = await this.generatePasswordResetToken(
      existingUser.id,
    )

    await this.mailService.sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token,
    )

    return true
  }

  public async newPassword(data: NewPasswordDto, token: string) {
    const existingToken = await this.prisma.token.findFirst({
      where: { token, type: TokenType.PASSWORD_RESET },
    })

    if (!existingToken) {
      throw new NotFoundException('Token not found')
    }

    const hasExpired = new Date(existingToken.expiresIn) < new Date()

    if (hasExpired) {
      throw new BadRequestException('Token expired')
    }

    const existingUser = await this.userService.findByEmail(existingToken.email)

    if (!existingUser) {
      throw new NotFoundException('User not found')
    }

    await this.prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        password: await hash(data.password),
      },
    })

    await this.prisma.token.delete({
      where: {
        id: existingToken.id,
      },
    })

    return true
  }

  private async generatePasswordResetToken(userId: string) {
    const token = v4()
    const expiresIn = new Date(new Date().getTime() + 60 * 60 * 1000)
    const user = await this.userService.findById(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const existingToken = await this.prisma.token.findFirst({
      where: { email: user.email, type: TokenType.PASSWORD_RESET },
    })

    if (existingToken) {
      await this.prisma.token.delete({
        where: { id: existingToken.id },
      })
    }

    const passwordResetToken = this.prisma.token.create({
      data: {
        email: user.email,
        token,
        expiresIn,
        type: TokenType.PASSWORD_RESET,
      },
    })

    return passwordResetToken
  }
}
