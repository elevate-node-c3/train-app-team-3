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
        privateKey: process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? 'identity-jwt-secret-key-test',
        publicKey: process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n') ?? 'identity-jwt-secret-key-test',
    },
    redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    },
    rabbitmq: {
        url: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
    },
    otp: {
        secret: process.env.OTP_HASH_SECRET ?? 'enr-identity-otp-hash-secret-2026',
    },
}));