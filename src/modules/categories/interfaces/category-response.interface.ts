import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';

export class CategoryResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  parentId?: string;

  @ApiProperty({
    description: 'Full path to this category',
    example: 'Fiction > Science Fiction > Space Opera',
  })
  path: string;

  constructor(category: Category, path: string) {
    this.id = category.id;
    this.name = category.name;
    this.parentId = category.parentId as string;
    this.path = path;
  }
}

export class CategoryTreeResponse extends CategoryResponse {
  @ApiProperty({ type: () => [CategoryTreeResponse] })
  children: CategoryTreeResponse[];
}
