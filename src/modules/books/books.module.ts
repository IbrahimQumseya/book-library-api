import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { Category } from '../categories/entities/category.entity';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Category]), CategoriesModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
