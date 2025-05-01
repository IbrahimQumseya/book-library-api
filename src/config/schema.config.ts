import * as Joi from 'joi';

type ConfigSchema = {
  PORT: number;
  STAGE: string;
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_DATABASE_NAME: string;
};

export const configValidationSchema = Joi.object<ConfigSchema>({
  PORT: Joi.number().default(3000),
  STAGE: Joi.string().required(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_DATABASE_NAME: Joi.string().required(),
});
