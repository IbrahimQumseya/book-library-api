import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../entities/book.entity';

export class BookResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({
    description: 'Category breadcrumb path',
    example: 'Fiction > Science Fiction > Space Opera',
  })
  categoryPath: string;

  constructor(book: Book, categoryPath: string) {
    this.id = book.id;
    this.name = book.name;
    this.categoryId = book.categoryId;
    this.categoryPath = categoryPath;
  }
}
