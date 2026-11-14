import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  CATALOG_PORT: Joi.number().default(50052),

  CATALOG_DB_HOST: Joi.string().required(),
  CATALOG_DB_PORT: Joi.number().default(5432),
  CATALOG_DB_USER: Joi.string().required(),
  CATALOG_DB_PASS: Joi.string().required(),
  CATALOG_DB_NAME: Joi.string().required(),
  CATALOG_DB_SYNC: Joi.boolean().default(false),

  RABBITMQ_URL: Joi.string().default('amqp://localhost:5672'),
  OUTBOX_ENCRYPTION_KEY: Joi.string().hex().length(64).required(),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
}).unknown(true);