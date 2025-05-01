import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/entities/category.entity';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';

describe('BooksService', () => {
  let service: BooksService;

  const mockCategory: Category = {
    id: '123',
    name: 'Test Category',
    parent: null,
    children: [],
    books: [],
  };

  const mockBook: Book = {
    id: '1',
    name: 'Test Book',
    category: {
      ...mockCategory,
    },
    categoryId: '123',
  };

  const mockBookRepository: Partial<Repository<Book>> = {
    findOne: jest.fn().mockImplementation(() => Promise.resolve(mockBook)),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCategoriesService: Partial<CategoriesService> = {
    findOne: jest.fn().mockImplementation(() => Promise.resolve(mockCategory)),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockBookRepository,
        },
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createBookDto = {
      name: 'Test Book',
      categoryId: '123',
    };

    it('should create a book successfully', async () => {
      mockBookRepository.findOne = jest.fn().mockResolvedValueOnce(null);
      mockCategoriesService.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockCategory);
      mockBookRepository.create = jest.fn().mockReturnValue(mockBook);
      mockBookRepository.save = jest.fn().mockResolvedValueOnce(mockBook);
      const result = await service.create(createBookDto);
      expect(result).toBeDefined();
      expect(mockBookRepository.create).toHaveBeenCalled();
      expect(mockBookRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if book name exists', async () => {
      mockBookRepository.findOne = jest.fn().mockResolvedValueOnce(mockBook);
      await expect(service.create(createBookDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a book if found', async () => {
      mockBookRepository.findOne = jest.fn().mockResolvedValueOnce(mockBook);
      const result = await service.findOne('1');
      expect(result).toEqual(mockBook);
    });

    it('should throw NotFoundException if book not found', async () => {
      mockBookRepository.findOne = jest.fn().mockResolvedValueOnce(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBreadcrumb', () => {
    it('should return correct breadcrumb for nested categories', () => {
      const bookWithNestedCategory = {
        ...mockBook,
        category: {
          id: '2',
          name: 'SubCategory',
          parent: {
            id: '1',
            name: 'MainCategory',
            parent: null,
          },
        },
      } as Book;
      const result = service.getBreadcrumb(bookWithNestedCategory);
      expect(result).toBe('MainCategory > SubCategory');
    });

    it('should return single category name for top-level category', () => {
      const result = service.getBreadcrumb(mockBook);
      expect(result).toBe('Test Category');
    });
  });

  describe('findByCategory', () => {
    it('should return books in category and subcategories', async () => {
      mockCategoriesService.findAllSubcategories = jest
        .fn()
        .mockResolvedValueOnce([mockCategory]);

      mockBookRepository.find = jest.fn().mockResolvedValueOnce([mockBook]);
      const result = await service.findByCategory('123');
      expect(result).toEqual([mockBook]);
    });
  });
});
