import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common'
import IORedis from 'ioredis'
import session from 'express-session'
import { ms, StringValue } from './libs/common/utils/ms.util'
import { parseBoolean } from './libs/common/utils/parse-boolean.util'
import { RedisStore } from 'connect-redis'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const redis = new IORedis(config.getOrThrow<string>('REDIS_URI'))

  app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow('SESSION_NAME'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN'),
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
        sameSite: 'lax',
      },
      store: new RedisStore({
        client: redis,
        prefix: config.getOrThrow<string>('SESSION_FOLDER'),
      }),
    }),
  )

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  })

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Budged guard API')
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('swagger', app, documentFactory)
  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  })

  await app.listen(config.getOrThrow<number>('APPLICATION_PORT') ?? 3000)
}
bootstrap()
