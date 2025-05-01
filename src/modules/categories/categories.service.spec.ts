// src/modules/categories/categories.service.spec.ts

import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoryTreeRepository: Partial<TreeRepository<Category>> = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    findAncestors: jest.fn(),
    findDescendants: jest.fn(),
    findTrees: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryTreeRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category successfully without parent', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
      };

      mockCategoryTreeRepository.findOne
        .mockResolvedValueOnce(null) // No duplicate name
        .mockResolvedValueOnce(null); // No parent needed

      mockCategoryTreeRepository.create.mockReturnValue(createCategoryDto);
      mockCategoryTreeRepository.save.mockResolvedValue(createCategoryDto);

      const result = await service.create(createCategoryDto);
      expect(result).toEqual(createCategoryDto);
    });

    it('should create a category successfully with parent', async () => {
      const parentCategory = {
        id: 'valid-parent-id',
        name: 'Parent Category',
      };

      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
        parentId: 'valid-parent-id',
      };

      mockCategoryTreeRepository.findOne
        .mockResolvedValueOnce(null) // No duplicate name
        .mockResolvedValueOnce(parentCategory); // Parent exists

      mockCategoryTreeRepository.create.mockReturnValue({
        ...createCategoryDto,
        parent: parentCategory,
      });

      mockCategoryTreeRepository.save.mockResolvedValue({
        ...createCategoryDto,
        parent: parentCategory,
      });

      const result = await service.create(createCategoryDto);
      expect(result.parent).toBeDefined();
      expect(result.parent.id).toBe('valid-parent-id');
    });

    it('should throw ConflictException if category name exists', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
      };

      mockCategoryTreeRepository.findOne.mockResolvedValueOnce({
        id: 'existing-id',
        name: 'Test Category',
      });

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if parent not found', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
        parentId: 'invalid-parent-id',
      };

      mockCategoryTreeRepository.findOne
        .mockResolvedValueOnce(null) // No duplicate name
        .mockResolvedValueOnce(null); // Parent not found

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Add more test cases for other methods...
});
