import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  // ۱. داکیومنت پنل ادمین
  const adminConfig = new DocumentBuilder()
    .setTitle('Vecaro - Admin API')
    .setDescription('مستندات کامل API پنل مدیریت وکارو')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const adminDocument = SwaggerModule.createDocument(app, adminConfig, {
    include: [
      // ماژول‌ها یا کنترلرهایی که فقط مربوط به ادمین هستند
    ],
  });
  SwaggerModule.setup('docs/admin', app, adminDocument);

  // ۲. داکیومنت فروشگاه (سایت اصلی)
  const storeConfig = new DocumentBuilder()
    .setTitle('Vecaro - Storefront API')
    .setDescription('مستندات API عمومی فروشگاه')
    .setVersion('1.0')
    .build();

  const storeDocument = SwaggerModule.createDocument(app, storeConfig);
  SwaggerModule.setup('docs/store', app, storeDocument);
}
