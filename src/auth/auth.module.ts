import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getRecaptchaConfig } from '../config/recaptcha.config'
import { ProviderModule } from './provider/provider.module'
import { getProvidersConfig } from '../config/providers.config'
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module'
import { UserModule } from '../user/user.module'
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service'
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module'
import { MailModule } from '../libs/mail/mail.module'

@Module({
  imports: [
    ProviderModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getProvidersConfig,
      inject: [ConfigService],
    }),
    GoogleRecaptchaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getRecaptchaConfig,
      inject: [ConfigService],
    }),
    UserModule,
    EmailConfirmationModule,
    TwoFactorAuthModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TwoFactorAuthService],
  exports: [AuthService],
})
export class AuthModule {}
