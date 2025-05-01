import { ConfigModule } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';

export const testConfig = {
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'test',
  password: 'test',
  database: 'book_library_test',
  autoLoadEntities: true,
  synchronize: true,
} as TypeOrmModuleOptions;

export const testConfigModule = ConfigModule.forRoot({
  validationSchema: Joi.object({
    DATABASE_HOST: Joi.string().default('localhost'),
    DATABASE_PORT: Joi.number().default(5433),
    DATABASE_USER: Joi.string().default('test'),
    DATABASE_PASSWORD: Joi.string().default('test'),
    DATABASE_NAME: Joi.string().default('book_library_test'),
  }),
});
