import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { setupSwagger } from './config/swagger.config';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://nimoura.shop',
      ];

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  app.enableShutdownHooks();
  app.set('trust proxy', 1);

  // Global API prefix (/api)
  app.setGlobalPrefix('api');

  // API Versioning (/api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global interceptors, filters, pipes
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

  // Swagger Documentation
  setupSwagger(app);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  logger.log(`Nimoura API running on: http://localhost:${port}/api/v1`);
  logger.log(`Admin Docs: http://localhost:${port}/docs/admin`);
  logger.log(`Store Docs: http://localhost:${port}/docs/store`);
}

void bootstrap();
