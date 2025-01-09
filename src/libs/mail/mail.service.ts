import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'
import { ConfirmationTemplate } from './templates/confirmation.template'

@Injectable()
export class MailService {
  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private sendEmail(email: string, subject: string, html: string) {
    return this.mailService.sendMail({ to: email, subject, html })
  }

  public async sendConfiramtionEmail(email: string, token: string) {
    const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
    // const html = await render(ConfirmationTemplate({ domain, token }))

    // return this.sendEmail(email, 'Confirm email', html)
  }
}
