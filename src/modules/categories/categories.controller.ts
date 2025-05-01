import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new category',
    description:
      'Creates a new category. Can be a root category or a child of an existing category.',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: Category,
  })
  @ApiResponse({
    status: 409,
    description: 'Category name already exists',
  })
  @ApiResponse({
    status: 404,
    description: 'Parent category not found',
  })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieves all categories in a flat list structure.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all categories',
    type: [Category],
  })
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a category by id',
    description:
      'Retrieves a single category by its ID, including its immediate children.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the category',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The found category with its immediate children',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a category',
    description:
      "Updates a category's information. Can update name and/or parent category.",
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the category to update',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Category name already exists or invalid parent category',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      return this.categoriesService.update(id, updateCategoryDto);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a category',
    description:
      'Deletes a category and all its subcategories. Books in the category will be orphaned.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the category to delete',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Category and its subcategories deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }

  @Get(':id/subcategories')
  @ApiOperation({
    summary: 'Get all subcategories of a category',
    description:
      'Retrieves all subcategories (nested at any level) of the specified category.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the parent category',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all subcategories',
    type: [Category],
  })
  @ApiResponse({
    status: 404,
    description: 'Parent category not found',
  })
  findSubcategories(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Category[]> {
    return this.categoriesService.findAllSubcategories(id);
  }
}
