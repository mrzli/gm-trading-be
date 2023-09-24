import { beforeEach, describe, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { RootModule } from '../src/modules/root/root.module';
import { ConfigOptions } from '../src/types';

const CONFIG_OPTIONS: ConfigOptions = {
  nodeEnv: 'test',
  logLevel: 'debug',
  port: 3000,
  apiPrefix: 'api',
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RootModule.register(CONFIG_OPTIONS)],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/app/hello (GET)', () => {
    return request(app.getHttpServer())
      .get('/app/hello')
      .expect(200)
      .expect('Hello World!');
  });
});
