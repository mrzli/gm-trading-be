import { beforeEach, describe, expect, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
import { ConfigOptions } from '../../types';
import { ConfigModule } from '../config/config.module';

const CONFIG_OPTIONS: ConfigOptions = {
  nodeEnv: 'test',
  logLevel: 'debug',
  port: 3000,
  apiPrefix: 'api',
  frontendUrl: undefined,
};

describe('ExampleController', () => {
  let exampleController: ExampleController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.register(CONFIG_OPTIONS)],
      controllers: [ExampleController],
      providers: [ExampleService],
    }).compile();

    exampleController = app.get<ExampleController>(ExampleController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(exampleController.getExample()).toBe('Hello World!');
    });
  });
});
