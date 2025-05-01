import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configValidationSchema } from './config/schema.config';
import { BooksModule } from './modules/books/books.module';
import { Book } from './modules/books/entities/book.entity';
import { CategoriesModule } from './modules/categories/categories.module';
import { Category } from './modules/categories/entities/category.entity';
@Module({
  imports: [
    BooksModule,
    CategoriesModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3000'),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE_NAME,
      entities: [Book, Category],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
