import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryTreeRepository: TreeRepository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if category with same name exists
    const existingCategory = await this.categoryTreeRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoryTreeRepository.create(createCategoryDto);

    if (createCategoryDto.parentId) {
      const parent = await this.categoryTreeRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      category.parent = parent;
    }

    return this.categoryTreeRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryTreeRepository.find({
      relations: ['children', 'parent'],
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryTreeRepository.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const ancestors = await this.findAncestors(category);
    category.ancestors = ancestors;

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryTreeRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.name) {
      category.name = updateCategoryDto.name;
    }

    if (updateCategoryDto.parentId) {
      const newParent = await this.categoryTreeRepository.findOne({
        where: { id: updateCategoryDto.parentId },
      });

      if (!newParent) {
        throw new NotFoundException('Parent category not found');
      }

      // Prevent circular reference
      if (id === updateCategoryDto.parentId) {
        throw new ConflictException('Category cannot be its own parent');
      }

      // Check if new parent is not a descendant
      const descendants =
        await this.categoryTreeRepository.findDescendants(category);
      if (descendants.some((desc) => desc.id === updateCategoryDto.parentId)) {
        throw new ConflictException(
          'Cannot move category under its own descendant',
        );
      }

      category.parent = newParent;
    }

    return this.categoryTreeRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryTreeRepository.findOne({
      where: { id },
      relations: ['children', 'books'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    try {
      await this.categoryTreeRepository.remove(category);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Failed to delete category');
    }
  }

  async findAllSubcategories(categoryId: string): Promise<Category[]> {
    const category = await this.categoryTreeRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const descendants = await this.categoryTreeRepository
      .createQueryBuilder('category')
      .where('category.parentId = :categoryId', { categoryId })
      .getMany();

    const allDescendants: Category[] = [];
    for (const descendant of descendants) {
      allDescendants.push(descendant);
      const subDescendants = await this.findAllSubcategories(descendant.id);
      allDescendants.push(...subDescendants);
    }

    return allDescendants;
  }

  async findAncestors(category: Category): Promise<Category[]> {
    return await this.categoryTreeRepository.findAncestors(category);
  }

  async getTree(): Promise<Category[]> {
    return this.categoryTreeRepository.findTrees();
  }

  async getFullCategoryPath(categoryId: string): Promise<Category[]> {
    // Get the category with its immediate parent
    const category = await this.categoryTreeRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Get all ancestors using the tree repository
    const ancestors = await this.findAncestors(category);

    // Sort ancestors by their materialized path to ensure correct order
    const sortedPath = ancestors
      // .sort((a, b) => (a.mpath?.length || 0) - (b.mpath?.length || 0))
      // Filter out the category itself if it's in the ancestors
      .filter((c) => c.id !== category.id);

    // Add the current category at the end
    return [...sortedPath, category];
  }
}
