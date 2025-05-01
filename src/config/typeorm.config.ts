import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Book } from '../modules/books/entities/book.entity';
import { Category } from '../modules/categories/entities/category.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '3000'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE_NAME,
  entities: [Book, Category],
  synchronize: process.env.NODE_ENV !== 'production',
};
