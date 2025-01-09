import { ConfigService } from '@nestjs/config'
import { MailerOptions } from '@nestjs-modules/mailer'
import { isDev } from '../libs/common/utils/is-dev.util'

export const getMailerConfig = async (
  configService: ConfigService,
): Promise<MailerOptions> => ({
  transport: {
    host: configService.getOrThrow<string>('MAIL_HOST'),
    port: configService.getOrThrow<number>('MAIL_PORT'),
    secure: isDev(configService),
    // Не используется при локальной разработке
    // auth: {
    //   user: configService.getOrThrow<string>('MAIL_USER'),
    //   password: configService.getOrThrow<string>('MAIL_PASSWORD'),
    // },
  },
  defaults: {
    from: `Infinity2326 dev`,
  },
})
