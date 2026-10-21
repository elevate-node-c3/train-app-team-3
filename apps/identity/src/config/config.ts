import { registerAs } from '@nestjs/config';

export default registerAs('identity', () => ({
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.IDENTITY_PORT) || 50051,
    database: {
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASS ?? 'postgres',
        name: process.env.DB_NAME ?? 'identity_db',
    },
    jwt: {
        privateKey: process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '',
        publicKey: process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n') ?? '',
    },
}));