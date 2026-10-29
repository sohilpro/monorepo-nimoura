// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'vecaro'),
        autoLoadEntities: true, // بارگذاری خودکار انتیتی‌های ثبت‌شده در ماژول‌ها
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        migrationsRun: true,
        logging: configService.get<boolean>('DB_LOGGING', true),
        ssl: configService.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        extra: {
          max: 25,
          idleTimeoutMillis: 30000,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}