import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('books')
export class Book {
  @ApiProperty({
    description: 'The unique identifier of the book',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The name of the book',
    example: 'The Lord of the Rings',
    minLength: 1,
    maxLength: 255,
    uniqueItems: true,
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'The ID of the category this book belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Column({ name: 'category_id' })
  categoryId: string;

  @ApiProperty({
    description: 'The category this book belongs to',
    type: () => Category,
  })
  @ManyToOne(() => Category, (category) => category.books, {
    onDelete: 'CASCADE', // When category is deleted, delete the book
    nullable: false, // Book must belong to a category
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiProperty({
    description: 'The breadcrumb path showing the full category hierarchy',
    example: 'Fiction > Science Fiction > Space Opera',
    required: false,
  })
  breadcrumb?: string;
}
