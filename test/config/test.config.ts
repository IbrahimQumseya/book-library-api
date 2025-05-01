import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { Book } from '../../src/modules/books/entities/book.entity';
import { Category } from '../../src/modules/categories/entities/category.entity';

export const TestConfigModule = ConfigModule.forRoot({
  envFilePath: 'test/.env.test',
  validationSchema: Joi.object({
    DB_HOST: Joi.string().default('localhost'),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().default('admin'),
    DB_PASSWORD: Joi.string().default('admin'),
    DB_NAME: Joi.string().default('book_library_test'),
  }),
});

export const testDbConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  database: 'book_library_test',
  entities: [Book, Category],
  autoLoadEntities: true,
  synchronize: true,
  dropSchema: true,
  logging: false,
};
