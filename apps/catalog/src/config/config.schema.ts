import * as Joi from 'joi';
 
export const configValidationSchema = Joi.object({
  CATALOG_GRPC_PORT: Joi.number().default(50052),
 
  CATALOG_DB_HOST: Joi.string().required(),
  CATALOG_DB_PORT: Joi.number().default(5432),
  CATALOG_DB_USER: Joi.string().required(),
  CATALOG_DB_PASSWORD: Joi.string().required(),
  CATALOG_DB_NAME: Joi.string().required(),
});