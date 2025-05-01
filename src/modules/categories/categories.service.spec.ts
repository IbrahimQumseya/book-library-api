// src/modules/categories/categories.service.spec.ts

import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsWhere } from 'typeorm';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoryRepository = {
    create: jest.fn().mockImplementation((dto: CreateCategoryDto) => dto),
    save: jest
      .fn()
      .mockImplementation((category: Category) => Promise.resolve(category)),
    findOne: jest
      .fn()
      .mockImplementation(
        ({ where }: { where: FindOptionsWhere<Category> }) => {
          if (where?.name) {
            return Promise.resolve(null); // Default: no duplicate found
          }
          // Check if searching by ID (parent check)
          if (where?.id === 'valid-parent-id') {
            return Promise.resolve({
              id: 'valid-parent-id',
              name: 'Parent Category',
            });
          }
          if (where?.id === 'invalid-parent-id') {
            return Promise.resolve(null);
          }
          return Promise.resolve(null);
        },
      ),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category successfully and does not have parentId', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
      };

      mockCategoryRepository.findOne = jest.fn().mockResolvedValueOnce(null);
      mockCategoryRepository.create = jest
        .fn()
        .mockReturnValue(createCategoryDto);
      mockCategoryRepository.save = jest
        .fn()
        .mockResolvedValueOnce(createCategoryDto);

      const result = await service.create(createCategoryDto);
      expect(result).toEqual(createCategoryDto);
    });

    it('should create a category successfully and has parentId', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
        parentId: 'valid-parent-id',
      };

      mockCategoryRepository.create = jest
        .fn()
        .mockReturnValue(createCategoryDto);
      mockCategoryRepository.save = jest
        .fn()
        .mockResolvedValueOnce(createCategoryDto);

      const result = await service.create(createCategoryDto);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'valid-parent-id' },
      });
      expect(result.parent).toBeDefined();
      expect(result.parent?.id).toEqual('valid-parent-id');
    });

    it('should throw ConflictException if category name already exists', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
      };

      mockCategoryRepository.findOne = jest
        .fn()
        .mockResolvedValueOnce(createCategoryDto);

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if parent category not found', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
        parentId: 'invalid-parent-id',
      };

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
