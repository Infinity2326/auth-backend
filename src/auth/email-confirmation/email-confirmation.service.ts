import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { v4 } from 'uuid'
import { TokenType } from '../../../prisma/__generated__'
import { Request } from 'express'
import { ConfirmationDto } from './dto/confirmation.dto'
import { MailService } from '../../libs/mail/mail.service'
import { UserService } from '../../user/user.service'
import { AuthService } from '../auth.service'

@Injectable()
export class EmailConfirmationService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  public async newVerification(request: Request, data: ConfirmationDto) {
    const existingToken = await this.prisma.token.findUnique({
      where: { token: data.token, type: TokenType.VERIFICATION },
    })

    if (!existingToken) {
      throw new NotFoundException('Token not found')
    }

    const hasExpired = new Date(existingToken.expiresIn) < new Date()

    if (hasExpired) {
      throw new BadRequestException('Token expired')
    }

    const exsitingUser = await this.userService.findByEmail(existingToken.email)

    if (!exsitingUser) {
      throw new NotFoundException('User with this email not found')
    }

    await this.prisma.user.update({
      where: { id: exsitingUser.id },
      data: {
        isVerifed: true,
      },
    })

    await this.prisma.token.delete({
      where: {
        id: existingToken.id,
      },
    })

    return await this.authService.saveSession(request, exsitingUser)
  }

  public async sendVerificationToken(userId: string) {
    const verificationToken = await this.generateVerificationToken(userId)

    await this.mailService.sendConfiramtionEmail(
      verificationToken.email,
      verificationToken.token,
    )

    return true
  }

  private async generateVerificationToken(userId: string) {
    const token = v4()
    const expiresIn = new Date(new Date().getTime() + 60 * 60 * 1000)
    const user = await this.userService.findById(userId)

    const existingToken = await this.prisma.token.findFirst({
      where: { email: user.email, type: TokenType.VERIFICATION },
    })

    if (existingToken) {
      await this.prisma.token.delete({
        where: {
          id: existingToken.id,
        },
      })
    }

    const verificationToken = this.prisma.token.create({
      data: {
        email: user.email,
        token,
        expiresIn,
        type: TokenType.VERIFICATION,
      },
    })

    return verificationToken
  }
}
