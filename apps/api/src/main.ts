import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // rawBody necessário para verificar assinatura do webhook Stripe
    rawBody: true,
  })

  app.enableCors({
    origin: [
      process.env.APP_URL ?? 'http://localhost:3000',
      process.env.WEB_URL ?? 'http://localhost:3001',
    ],
    credentials: true,
  })

  app.setGlobalPrefix('api/v1')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  const port = process.env.PORT ?? 4000
  await app.listen(port)
  console.log(`FashionWay API running on http://localhost:${port}/api/v1`)
}

bootstrap()
