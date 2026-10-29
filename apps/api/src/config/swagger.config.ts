import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  // ۱. داکیومنت پنل ادمین
  const adminConfig = new DocumentBuilder()
    .setTitle('Nimoura - Admin API')
    .setDescription('مستندات کامل API پنل مدیریت نیمورا')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const adminDocument = SwaggerModule.createDocument(app, adminConfig);
  SwaggerModule.setup('docs/admin', app, adminDocument);

  // ۲. داکیومنت فروشگاه (سایت اصلی)
  const storeConfig = new DocumentBuilder()
    .setTitle('Nimoura - Storefront API')
    .setDescription('مستندات API عمومی فروشگاه نیمورا')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const storeDocument = SwaggerModule.createDocument(app, storeConfig);
  SwaggerModule.setup('docs/store', app, storeDocument);
}
