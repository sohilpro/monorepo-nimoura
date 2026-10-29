// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { setupSwagger } from './config/swagger.config';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true,
    },
  });
   app.set('trust proxy', 1);

  // تنظیم پیشوند گلوبال برای APIها (مثلاً /api)
  app.setGlobalPrefix('api');

  // پشتیبانی از نسخه‌بندی (مثلاً /api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ثبت گلوبال اینترسپتور، فیلتر خطاها و اعتبارسنجی
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // راه‌اندازی مستندات Swagger
  setupSwagger(app);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Server is running on: http://localhost:${port}/api/v1`);
  console.log(`Admin Docs: http://localhost:${port}/docs/admin`);
  console.log(`Store Docs: http://localhost:${port}/docs/store`);
}

bootstrap();