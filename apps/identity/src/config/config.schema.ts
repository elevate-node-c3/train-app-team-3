import Joi from "joi";

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  IDENTITY_PORT: Joi.number().default(50051),
  DB_HOST: Joi.string().default("localhost"),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().default("postgres"),
  DB_PASS: Joi.string().default("postgres"),
  DB_NAME: Joi.string().default("identity_db"),
  REDIS_HOST: Joi.string().default("localhost"),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow("").default(""),
  //JWT validation
  JWT_PRIVATE_KEY: Joi.string().required(),
  JWT_PUBLIC_KEY: Joi.string().required(),
});
