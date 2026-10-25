import Joi from 'joi';

export const configValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT_GATEWAY: Joi.number().default(3000),
    IDENTITY_GRPC_URL: Joi.string().default('localhost:50051'),
    JWT_ACCESS_SECRET: Joi.string().required(),
});