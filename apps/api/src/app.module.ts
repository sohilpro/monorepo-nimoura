// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/user.module';
import { ProductsModule } from './modules/products/products.module';
import { CommentsModule } from './modules/comments/comments.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/orders/order.module';
import { PromotionModule } from './modules/promotions/promotions.module';
import { AddressesModule } from './modules/users/addresses/address.module';
import { SearchModule } from './modules/search/search.module';
import { TagsModule } from './modules/tags/tag.module';
import { PaymentModule } from './modules/payments/payments.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { MediaModule } from './modules/media/media.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/auth/guards/roles.guard';
import { AccessTokenGuard } from './common/auth/guards/access-token.guard';
import { JwtModule } from '@nestjs/jwt';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { MagazineModule } from './modules/magazine/magazine.module';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { ServeStaticModule } from '@nestjs/serve-static';

const resolveUploadsPath = (): string => {
  const monorepoPath = join(process.cwd(), 'apps', 'api', 'uploads');
  if (existsSync(monorepoPath)) {
    return monorepoPath;
  }
  return join(process.cwd(), 'uploads');
};
import { BannersModule } from './modules/banners/banners.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceListModule } from './modules/price-list/price-list.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TorobModule } from './modules/torob/torob.module';
import { validateEnv } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: [
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), '../../.env'),
        resolve(__dirname, '../../../.env'),
        resolve(__dirname, '../../.env'),
      ],
    }),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your_jwt_secret',
    }),

    ServeStaticModule.forRoot({
      rootPath: resolveUploadsPath(),
      serveRoot: '/uploads',
    }),

    CacheModule.register({
      isGlobal: true, // ماژول در تمام پروژه در دسترس قرار می‌گیرد
      ttl: 60 * 1000, // زمان پیش‌فرض انقضای کش (میلی‌ثانیه)
      max: 100, // حداکثر تعداد آیتم‌های ذخیره‌شده در رم (جلوگیری از پر شدن حافظه)
    }),

    ScheduleModule.forRoot(),

    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 300 }], // سقف بالاتر
      // درخواست‌های سرور Nuxt را محدود نکن (آی‌پی داخلی/لوکال خودت را بگذار)
      skipIf: (ctx) => {
        const ip = ctx.switchToHttp().getRequest().ip;
        return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip);
      },
    }),

    DatabaseModule,
    AuthModule,
    ProductsModule,
    CommentsModule,
    UsersModule,
    CategoriesModule,
    CartModule,
    OrderModule,
    PromotionModule,
    AddressesModule,
    SearchModule,
    TagsModule,
    PaymentModule,
    BannersModule,
    WishlistModule,
    MediaModule,
    BrandsModule,
    MagazineModule,
    PriceListModule,
    TorobModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
