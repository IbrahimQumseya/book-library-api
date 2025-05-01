import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
