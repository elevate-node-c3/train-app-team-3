import Joi from 'joi';

export const configValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT_GATEWAY: Joi.number().default(3000),
    IDENTITY_GRPC_URL: Joi.string().default('localhost:50051'),
    CATALOG_GRPC_URL: Joi.string().default('localhost:50052'),
    INVENTORY_GRPC_URL: Joi.string().default('localhost:50053'),
    BOOKING_GRPC_URL: Joi.string().default('localhost:50054'),
    PAYMENT_GRPC_URL: Joi.string().default('localhost:50055'),
    NOTIFICATION_GRPC_URL: Joi.string().default('localhost:50056'),
    JWT_ACCESS_SECRET: Joi.string().required(),
});