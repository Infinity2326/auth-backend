import { Module } from '@nestjs/common'
import { TwoFactorAuthService } from './two-factor-auth.service'
import { MailService } from '../../libs/mail/mail.service'
import { UserService } from '../../user/user.service'
import { MailModule } from '../../libs/mail/mail.module'

@Module({
  controllers: [],
  providers: [TwoFactorAuthService, MailService, UserService],
  imports: [MailModule],
  exports: [TwoFactorAuthService],
})
export class TwoFactorAuthModule {}
