import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    description: 'The name of the book',
    example: 'The Lord of the Rings',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The ID of the category this book belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}
