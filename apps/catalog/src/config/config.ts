import { registerAs } from '@nestjs/config';

export default registerAs('catalog', () => ({
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.CATALOG_PORT) || 50052,
    database: {
        host: process.env.CATALOG_DB_HOST ?? 'localhost',
        port: Number(process.env.CATALOG_DB_PORT) || 5432,
        username: process.env.CATALOG_DB_USER ?? 'postgres',
        password: process.env.CATALOG_DB_PASS ?? 'postgres',
        name: process.env.CATALOG_DB_NAME ?? 'catalog_db',
    },
}));