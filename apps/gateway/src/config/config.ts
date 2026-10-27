import { registerAs } from '@nestjs/config';

export default registerAs('gateway', () => ({
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT_GATEWAY) || 3000,
    identityGrpcUrl: process.env.IDENTITY_GRPC_URL ?? 'localhost:50051',
    catalogGrpcUrl: process.env.CATALOG_GRPC_URL ?? 'localhost:50052',
    inventoryGrpcUrl: process.env.INVENTORY_GRPC_URL ?? 'localhost:50053',
    bookingGrpcUrl: process.env.BOOKING_GRPC_URL ?? 'localhost:50054',
    paymentGrpcUrl: process.env.PAYMENT_GRPC_URL ?? 'localhost:50055',
    notificationGrpcUrl: process.env.NOTIFICATION_GRPC_URL ?? 'localhost:50056',
}));