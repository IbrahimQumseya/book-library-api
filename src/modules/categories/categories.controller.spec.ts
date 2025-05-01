import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategory: Category = {
    id: '1',
    name: 'Test Category',
    parent: null,
    children: [],
    books: [],
  };

  const mockCategoryService: Partial<CategoriesService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: getRepositoryToken(Category),
          useValue: {},
        },
        {
          provide: CategoriesService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
      };

      mockCategoryService.create = jest
        .fn()
        .mockResolvedValueOnce(mockCategory);

      const result = await controller.create(createCategoryDto);

      expect(result).toEqual(mockCategory);
      expect(mockCategoryService.create).toHaveBeenCalledWith(
        createCategoryDto,
      );
    });

    it('should throw a ConflictException if the category name already exists', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
      };

      mockCategoryService.create = jest
        .fn()
        .mockRejectedValueOnce(
          new ConflictException('Category with this name already exists'),
        );

      await expect(controller.create(createCategoryDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      mockCategoryService.findAll = jest
        .fn()
        .mockResolvedValueOnce([mockCategory]);

      const result = await controller.findAll();

      expect(result).toEqual([mockCategory]);
      expect(mockCategoryService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      mockCategoryService.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockCategory);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockCategory);
      expect(mockCategoryService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Category',
      };

      mockCategoryService.update = jest
        .fn()
        .mockResolvedValueOnce(mockCategory);

      const result = await controller.update('1', updateCategoryDto);

      expect(result).toEqual(mockCategory);
      expect(mockCategoryService.update).toHaveBeenCalledWith(
        '1',
        updateCategoryDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a category successfully', async () => {
      mockCategoryService.remove = jest.fn().mockResolvedValueOnce(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(mockCategoryService.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('findSubcategories', () => {
    it('should return all subcategories of a category', async () => {
      mockCategoryService.findAllSubcategories = jest
        .fn()
        .mockResolvedValueOnce([mockCategory]);

      const result = await controller.findSubcategories('1');

      expect(result).toEqual([mockCategory]);
      expect(mockCategoryService.findAllSubcategories).toHaveBeenCalledWith(
        '1',
      );
    });
  });

  // Add more tests here...
});
