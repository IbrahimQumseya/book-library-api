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

describe('Categories Integration Tests', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let dataSource: DataSource;
  let parentCategoryId: string;
  let childCategoryId: string;

  beforeAll(async () => {
    jest.setTimeout(30000);

    moduleFixture = await Test.createTestingModule({
      imports: [
        TestConfigModule,
        TypeOrmModule.forRoot(testDbConfig),
        CategoriesModule,
        BooksModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /categories', () => {
    it('should create a parent category first', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Parent Category',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      parentCategoryId = response.body.id;
    });

    it('should create a child category after parent exists', async () => {
      const parentResponse = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Parent Category',
        });
      parentCategoryId = parentResponse.body.id;

      const response = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Child Category',
          parentId: parentCategoryId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.parentId).toBe(parentCategoryId);
    });

    it('should fail to create category with duplicate name', async () => {
      await request(app.getHttpServer()).post('/categories').send({
        name: 'Unique Category',
      });

      const response = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Unique Category',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /categories', () => {
    beforeEach(async () => {
      const parent = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'Test Parent' });
      parentCategoryId = parent.body.id;

      const child = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Test Child',
          parentId: parentCategoryId,
        });
      childCategoryId = child.body.id;
    });

    it('should return all categories', async () => {
      const response = await request(app.getHttpServer()).get('/categories');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return category with its children', async () => {
      const response = await request(app.getHttpServer()).get(
        `/categories/${parentCategoryId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('children');
      expect(response.body.children[0].id).toBe(childCategoryId);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('should update a category', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Category to Update',
        });
      const categoryId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .send({
          name: 'Updated Child Category',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Child Category');
    });
  });

  describe('DELETE /categories/:id', () => {
    let parentId: string;
    let childId: string;

    beforeEach(async () => {
      await clearDatabase(dataSource);

      const parentResponse = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'Parent To Delete' });
      parentId = parentResponse.body.id;

      const childResponse = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Child To Delete',
          parentId: parentId,
        });
      childId = childResponse.body.id;

      expect(parentResponse.status).toBe(201);
      expect(childResponse.status).toBe(201);
    });

    it('should delete a category and its children', async () => {
      const beforeParentGet = await request(app.getHttpServer()).get(
        `/categories/${parentId}`,
      );
      const beforeChildGet = await request(app.getHttpServer()).get(
        `/categories/${childId}`,
      );

      expect(beforeParentGet.status).toBe(200);
      expect(beforeChildGet.status).toBe(200);

      const response = await request(app.getHttpServer()).delete(
        `/categories/${parentId}`,
      );

      expect(response.status).toBe(200);

      const afterParentGet = await request(app.getHttpServer()).get(
        `/categories/${parentId}`,
      );
      const afterChildGet = await request(app.getHttpServer()).get(
        `/categories/${childId}`,
      );

      expect(afterParentGet.status).toBe(404);
      expect(afterChildGet.status).toBe(404);
    });

    it('should fail to delete non-existent category', async () => {
      const uuid = randomUUID();
      const response = await request(app.getHttpServer()).delete(
        `/categories/${uuid}`,
      );

      expect(response.status).toBe(404);
    });
  });
});
