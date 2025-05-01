import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new book',
    description: 'Creates a new book with the given name and category.',
  })
  @ApiResponse({
    status: 201,
    description: 'Book created successfully.',
    type: Book,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input - please check the request body.',
  })
  @ApiResponse({
    status: 409,
    description: 'A book with this name already exists.',
  })
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all books with pagination',
    description: 'Retrieves a paginated list of all books in the system.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of books',
    schema: {
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Book' },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            totalItems: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.booksService.findAll(paginationQuery);
  }

  @Get('by-category/:categoryId')
  @ApiOperation({
    summary: 'Get books by category with pagination',
    description:
      'Retrieves a paginated list of books in the specified category and its subcategories.',
  })
  @ApiParam({
    name: 'categoryId',
    required: true,
    description: 'UUID of the category',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of books in the category',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  findByCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.booksService.findByCategoryWithPagination(
      categoryId,
      paginationQuery,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a book by id with category breadcrumb',
    description:
      'Retrieves a single book by its ID, including its category breadcrumb path.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the book',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The found book with its category breadcrumb',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/Book' },
        {
          properties: {
            breadcrumb: {
              type: 'string',
              example: 'Fiction > Science Fiction > Space Opera',
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Book & { breadcrumb: string }> {
    const book = await this.booksService.findOne(id);
    const breadcrumb = await this.booksService.getBreadcrumb(book);
    return { ...book, breadcrumb };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a book',
    description:
      "Updates a book's information. Only provided fields will be updated.",
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the book to update',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Book updated successfully',
    type: Book,
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Book name already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a book',
    description: 'Permanently removes a book from the system.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the book to delete',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Book deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.booksService.remove(id);
  }
}
