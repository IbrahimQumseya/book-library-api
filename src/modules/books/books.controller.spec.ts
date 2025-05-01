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
      parent: null,
      books: [],
      children: [],
    },
    categoryId: '1',
  };

  const mockBooks: Book[] = [mockBook];

  const mockBooksService: Partial<BooksService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getBreadcrumb: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCategoryService: Partial<CategoriesService> = {
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
        BooksService,
        CategoriesService,
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

      mockBooksService.create = jest.fn().mockResolvedValueOnce(mockBook);

      const result = await controller.create(createBookDto);
      expect(result).toEqual(mockBook);
    });

    it('should throw a ConflictException if the book name already exists', async () => {
      const createBookDto: CreateBookDto = {
        name: 'Test Book',
        categoryId: '1',
      };

      mockBooksService.create = jest
        .fn()
        .mockRejectedValueOnce(
          new ConflictException('Book with this name already exists'),
        );

      await expect(controller.create(createBookDto)).rejects.toThrow(
        ConflictException,
      );
    });

    describe('findAll', () => {
      it('should return an array of books', async () => {
        mockBooksService.findAll = jest.fn().mockResolvedValue(mockBooks);

        const result = await controller.findAll();

        expect(result).toEqual(mockBooks);
        expect(mockBooksService.findAll).toHaveBeenCalled();
      });

      it('should return an array of books by category', async () => {
        mockBooksService.findByCategory = jest
          .fn()
          .mockResolvedValue(mockBooks);

        const result = await controller.findAll('1');

        expect(result).toEqual(mockBooks);
        expect(mockBooksService.findByCategory).toHaveBeenCalledWith('1');
      });
    });

    describe('findOne', () => {
      it('should return a book by id', async () => {
        mockBooksService.findOne = jest.fn().mockResolvedValue(mockBook);

        const result = await controller.findOne('1');

        expect(result).toEqual(mockBook);
        expect(mockBooksService.findOne).toHaveBeenCalledWith('1');
      });

      it('should return a book by id with category breadcrumb', async () => {
        mockBooksService.findOne = jest.fn().mockResolvedValue(mockBook);
        mockBooksService.getBreadcrumb = jest
          .fn()
          .mockReturnValue('Test Breadcrumb');

        const result = await controller.findOne('1');

        expect(result).toEqual({ ...mockBook, breadcrumb: 'Test Breadcrumb' });
      });
    });
  });
  // Add more tests here...
});
