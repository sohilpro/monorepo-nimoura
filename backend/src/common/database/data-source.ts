import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

// بارگذاری .env از مسیر جاری و ریشه مونو‌ریپو
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(__dirname, '../../../.env') });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',

  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'vecaro',

  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],

  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  synchronize: false,
  migrationsRun: true,

  logging: process.env.DB_LOGGING === 'true',

  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
