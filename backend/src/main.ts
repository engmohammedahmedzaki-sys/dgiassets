import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));

  // Global validation pipe — rejects invalid bodies (e.g. malformed emails)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const first = errors[0];
        const messages = first?.constraints
          ? (Object.values(first.constraints) as string[])
          : ['البيانات المرسلة غير صحيحة'];
        return new (require('@nestjs/common').BadRequestException)(messages[0]);
      },
    }),
  );

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable CORS
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN || '').split(',')
    : ['http://localhost:4200'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application running on port ${port}`);
}
void bootstrap();
