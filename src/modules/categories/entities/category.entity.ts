import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { Book } from '../../books/entities/book.entity';

@Entity('categories')
@Tree('materialized-path')
export class Category {
  @ApiProperty({
    description: 'The unique identifier of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The name of the category',
    example: 'Science Fiction',
    minLength: 1,
    maxLength: 255,
    uniqueItems: true,
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'Subcategories of this category',
    type: () => [Category],
    isArray: true,
    required: false,
  })
  @TreeChildren({ cascade: true })
  children: Category[];

  @ApiProperty({
    description: 'Parent category if this is a subcategory',
    type: () => Category,
    required: false,
    nullable: true,
  })
  @TreeParent({ onDelete: 'CASCADE' })
  parent: Category | null;

  @ApiProperty({
    description: 'The ID of the parent category',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false,
    nullable: true,
  })
  @Column({ nullable: true })
  parentId: string | null;

  @ApiProperty({
    description: 'The books in this category',
    type: () => [Book],
    isArray: true,
  })
  @OneToMany(() => Book, (book) => book.category, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  books: Book[];

  @ApiProperty({
    description: 'List of ancestor categories from root to this category',
    type: () => [Category],
    isArray: true,
    required: false,
  })
  ancestors?: Category[];
}
