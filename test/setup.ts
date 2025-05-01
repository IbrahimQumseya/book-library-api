import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestConfigModule, testDbConfig } from './config/test.config';

export async function setupTestApp(modules: any[]): Promise<{
  app: INestApplication;
  moduleFixture: TestingModule;
}> {
  const moduleFixture = await Test.createTestingModule({
    imports: [
      TestConfigModule,
      TypeOrmModule.forRoot(testDbConfig),
      ...modules,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.init();

  return { app, moduleFixture };
}
