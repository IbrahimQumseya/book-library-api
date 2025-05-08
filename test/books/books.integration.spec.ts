import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { BooksModule } from '../../src/modules/books/books.module';
import { CategoriesModule } from '../../src/modules/categories/categories.module';
import { TestConfigModule, testDbConfig } from '../config/test.config';
import { clearDatabase } from '../utils/database.util';

describe('Books Integration Tests', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let dataSource: DataSource;
  let categoryId: string;
  let bookId: string;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        TestConfigModule,
        TypeOrmModule.forRoot(testDbConfig),
        BooksModule,
        CategoriesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);

    const categoryResponse = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Test Category' });
    const booksGetResponse = await request(app.getHttpServer())
      .post('/books')
      .send({ name: 'Test Book', categoryId: categoryResponse.body.id });
    await request(app.getHttpServer())
      .post('/books')
      .send({ name: 'Test Book 2', categoryId: categoryResponse.body.id });
    bookId = booksGetResponse.body.id;
    categoryId = categoryResponse.body.id;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /books', () => {
    it('should create a new book', async () => {
      const response = await request(app.getHttpServer()).post('/books').send({
        name: 'Unique New Book', // Changed name to avoid conflict
        categoryId: categoryId,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Unique New Book');
      expect(response.body.categoryId).toBe(categoryId);
    });

    it('should fail to create a book with duplicate name', async () => {
      // First create a book
      await request(app.getHttpServer()).post('/books').send({
        name: 'Unique Book',
        categoryId: categoryId,
      });

      // Try to create another with same name
      const response = await request(app.getHttpServer()).post('/books').send({
        name: 'Unique Book',
        categoryId: categoryId,
      });

      expect(response.status).toBe(409);
    });

    it('should fail to create a book with invalid category', async () => {
      const uuid = randomUUID();
      const response = await request(app.getHttpServer()).post('/books').send({
        name: 'New Test Book',
        categoryId: uuid,
      });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /books', () => {
    beforeEach(async () => {
      const response = await request(app.getHttpServer()).post('/books').send({
        name: 'Test Book',
        categoryId: categoryId,
      });
      bookId = response.body.id;
    });

    it('should return paginated books', async () => {
      const response = await request(app.getHttpServer())
        .get('/books')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('page', 1);
      expect(response.body.meta).toHaveProperty('limit', 10);
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should return books by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/books')
        .query({ categoryId: categoryId });

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0].categoryId).toBe(categoryId);
    });
  });

  describe('GET /books/:id', () => {
    it('should return a book by id with breadcrumb', async () => {
      const response = await request(app.getHttpServer()).get(
        `/books/${bookId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', bookId);
      expect(response.body).toHaveProperty('breadcrumb');
    });

    it('should return 404 for non-existent book', async () => {
      const response = await request(app.getHttpServer()).get(
        '/books/12345678-1234-1234-1234-123456789012',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /books/:id', () => {
    it('should update a book', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/books/${bookId}`)
        .send({
          name: 'Updated Test Book',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Test Book');
    });

    it('should fail to update with duplicate name', async () => {
      const createBook = await request(app.getHttpServer())
        .post('/books')
        .send({
          name: 'a Book',
          categoryId: categoryId,
        });

      const response = await request(app.getHttpServer())
        .patch(`/books/${createBook.body.id}`)
        .send({
          name: 'Test Book 2',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /books/:id', () => {
    it('should delete a book', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/books/${bookId}`,
      );

      expect(response.status).toBe(200);

      const getResponse = await request(app.getHttpServer()).get(
        `/books/${bookId}`,
      );
      expect(getResponse.status).toBe(404);
    });
  });
});
