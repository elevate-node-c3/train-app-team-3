import { registerAs } from '@nestjs/config';

export default registerAs('gateway', () => ({
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT_GATEWAY) || 3000,
    identityGrpcUrl: process.env.IDENTITY_GRPC_URL ?? 'localhost:50051',
}));