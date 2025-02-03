import { ConfigService } from '@nestjs/config'
import { MailerOptions } from '@nestjs-modules/mailer'

export const getMailerConfig = async (
  configService: ConfigService,
): Promise<MailerOptions> => {
  const user = configService.get<string>('MAIL_USER')
  const pass = configService.get<string>('MAIL_PASSWORD')

  if (!user || !pass) {
    console.error('Ошибка: MAIL_USER или MAIL_PASSWORD отсутствуют в .env!')
    throw new Error('MAIL_USER и MAIL_PASSWORD обязательны!')
  }

  return {
    transport: {
      host: configService.getOrThrow<string>('MAIL_HOST'),
      port: configService.getOrThrow<number>('MAIL_PORT'),
      secure: true, // true for 465, false for 587
      auth: {
        user,
        pass,
      },
    },
    defaults: {
      from: configService.get<string>('MAIL_FROM') || user,
    },
  }
}
