import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 4000;

  @IsString()
  @IsOptional()
  DB_HOST: string = 'localhost';

  @IsNumber()
  @IsOptional()
  DB_PORT: number = 5432;

  @IsString()
  @IsOptional()
  DB_USERNAME: string = 'postgres';

  @IsString()
  @IsOptional()
  DB_PASSWORD: string = 'postgres';

  @IsString()
  @IsOptional()
  DB_NAME: string = 'nimoura';

  @IsString()
  @IsOptional()
  JWT_SECRET: string = 'nimoura_default_jwt_secret';

  @IsString()
  @IsOptional()
  REFRESH_TOKEN_SECRET?: string;

  @IsString()
  @IsOptional()
  OTP_TOKEN_SECRET?: string;

  @IsString()
  @IsOptional()
  INTERNAL_API_KEY?: string;

  @IsString()
  @IsOptional()
  ALLOWED_ORIGINS?: string;

  @IsString()
  @IsOptional()
  APP_URL?: string;

  @IsString()
  @IsOptional()
  API_URL?: string;

  @IsString()
  @IsOptional()
  MELI_SMS_USER?: string;

  @IsString()
  @IsOptional()
  MELI_SMS_PASS?: string;

  @IsString()
  @IsOptional()
  MELI_SMS_PATTERN_CODE?: string;

  @IsString()
  @IsOptional()
  MELI_SMS_PATTERN_ORDER?: string;

  @IsString()
  @IsOptional()
  MELI_SMS_PATTERN_REFERRAL?: string;

  @IsString()
  @IsOptional()
  MELI_SMS_PATTERN_NEWSLETTER?: string;

  @IsString()
  @IsOptional()
  MELI_SMS_PATTERN_ORDER_SEND?: string;

  @IsString()
  @IsOptional()
  MELI_SMS_PATTERN_FIRST_ORDER?: string;

  @IsString()
  @IsOptional()
  MELI_FIRST_ORDER?: string;

  @IsString()
  @IsOptional()
  ZARINPAL_MERCHANT_ID?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}
