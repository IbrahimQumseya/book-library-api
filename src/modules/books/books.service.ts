import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { In, Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/entities/category.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    // Check if book with same name exists
    const existingBook = await this.bookRepository.findOne({
      where: { name: createBookDto.name },
    });

    if (existingBook) {
      throw new ConflictException('Book with this name already exists');
    }

    // Verify category exists
    const category = await this.categoriesService.findOne(
      createBookDto.categoryId,
    );

    const book = this.bookRepository.create({
      name: createBookDto.name,
      category,
    });

    return this.bookRepository.save(book);
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [items, total] = await this.bookRepository.findAndCount({
      skip,
      take: limit,
      relations: ['category'],
      order: { name: 'ASC' },
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pageCount: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Book & { breadcrumb: string }> {
    // First, find the book
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Get all ancestors using the tree repository
    const ancestors = await this.categoriesService.getFullCategoryPath(
      book.category.id,
    );

    // Create breadcrumb from all ancestors
    const breadcrumb = ancestors.map((cat) => cat.name).join(' > ');

    return {
      ...book,
      category: book.category,
      breadcrumb,
    };
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    if (updateBookDto.name && updateBookDto.name !== book.name) {
      const existingBook = await this.bookRepository.findOne({
        where: { name: updateBookDto.name },
      });

      if (existingBook) {
        throw new ConflictException('Book with this name already exists');
      }
    }

    if (updateBookDto.categoryId) {
      const category = await this.categoriesService.findOne(
        updateBookDto.categoryId,
      );
      book.category = category;
    }

    Object.assign(book, updateBookDto);
    return this.bookRepository.save(book);
  }

  async remove(id: string): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
  }

  async findByCategoryWithPagination(
    categoryId: string,
    paginationQuery: PaginationQueryDto,
  ) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const categories =
      await this.categoriesService.findAllSubcategories(categoryId);
    const categoryIds = [categoryId, ...categories.map((cat) => cat.id)];

    const [items, total] = await this.bookRepository.findAndCount({
      where: {
        category: { id: In(categoryIds) },
      },
      skip,
      take: limit,
      relations: ['category'],
      order: { name: 'ASC' },
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pageCount: Math.ceil(total / limit),
      },
    };
  }

  async findByCategory(categoryId: string): Promise<Book[]> {
    // Get the category and all its subcategories
    const categories =
      await this.categoriesService.findAllSubcategories(categoryId);
    const categoryIds = [categoryId, ...categories.map((cat) => cat.id)];

    // Find all books in these categories
    return this.bookRepository.find({
      where: {
        category: { id: In(categoryIds) },
      },
      relations: ['category'],
    });
  }

  async getBreadcrumb(book: Book): Promise<string> {
    const ancestors = await this.categoriesService.findAncestors(book.category);

    const path: string[] = [];
    let currentCategory: Category | undefined = book.category;

    while (currentCategory) {
      path.unshift(currentCategory.name);
      currentCategory = ancestors.find(
        (c) => c.id === currentCategory?.parentId,
      );
    }

    return path.join(' > ');
  }
}
