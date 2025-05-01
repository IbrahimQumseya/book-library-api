import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/entities/category.entity';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Book } from './entities/book.entity';

describe('BooksController', () => {
  let controller: BooksController;

  const mockBook: Book = {
    id: '1',
    name: 'Test Book',
    category: {
      id: '1',
      name: 'Test Category',
      books: [],
      children: [],
      parent: null,
      parentId: null,
    },
    categoryId: '1',
  };

  const mockBooks: Book[] = [mockBook];

  const mockPaginatedResponse = {
    items: mockBooks,
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      pageCount: 1,
    },
  };

  const mockBooksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getBreadcrumb: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByCategoryWithPagination: jest.fn(),
  };

  const mockCategoryService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
        {
          provide: CategoriesService,
          useValue: mockCategoryService,
        },
        {
          provide: getRepositoryToken(Book),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a book successfully', async () => {
      const createBookDto: CreateBookDto = {
        name: 'Test Book',
        categoryId: '1',
      };

      mockBooksService.create.mockResolvedValueOnce(mockBook);

      const result = await controller.create(createBookDto);
      expect(result).toEqual(mockBook);
    });

    it('should throw a ConflictException if the book name already exists', async () => {
      const createBookDto: CreateBookDto = {
        name: 'Test Book',
        categoryId: '1',
      };

      mockBooksService.create.mockRejectedValueOnce(
        new ConflictException('Book with this name already exists'),
      );

      await expect(controller.create(createBookDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of books', async () => {
      mockBooksService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll({
        limit: 10,
        page: 1,
      });

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockBooksService.findAll).toHaveBeenCalledWith({
        limit: 10,
        page: 1,
      });
    });
  });

  describe('findByCategory', () => {
    it('should return a paginated list of books by category', async () => {
      mockBooksService.findByCategoryWithPagination.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await controller.findByCategory('1', {
        limit: 10,
        page: 1,
      });

      expect(result).toEqual(mockPaginatedResponse);
      expect(
        mockBooksService.findByCategoryWithPagination,
      ).toHaveBeenCalledWith('1', {
        limit: 10,
        page: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a book by id with breadcrumb', async () => {
      mockBooksService.findOne.mockResolvedValue(mockBook);
      mockBooksService.getBreadcrumb.mockResolvedValue('Test Category');

      const result = await controller.findOne('1');

      expect(result).toEqual({
        ...mockBook,
        breadcrumb: 'Test Category',
      });
      expect(mockBooksService.findOne).toHaveBeenCalledWith('1');
      expect(mockBooksService.getBreadcrumb).toHaveBeenCalledWith(mockBook);
    });
  });
});
