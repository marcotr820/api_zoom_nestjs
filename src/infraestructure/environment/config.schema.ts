import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  APP_PORT: Joi.number().required(),
  TZ: Joi.string().required(),

  DB_TYPE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432).required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});
