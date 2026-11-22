import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { migrations } from './migrations';

dotenv.config({ path: join(process.cwd(), 'apps/catalog/.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env.CATALOG_DB_HOST ?? 'localhost',
  port: Number(process.env.CATALOG_DB_PORT) || 5432,
  username: process.env.CATALOG_DB_USER ?? 'postgres',
  password: process.env.CATALOG_DB_PASS ?? 'postgres',
  database: process.env.CATALOG_DB_NAME ?? 'catalog_db',
  entities: [
    join(process.cwd(), 'apps/catalog/src/modules/**/*.{entity,entitiy}.{ts,js}'),
    join(process.cwd(), 'libs/outbox/outbox.entity.{ts,js}'),
  ],
  migrations,
  synchronize: false,
});