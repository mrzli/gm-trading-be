import { Controller, Get } from '@nestjs/common';
import { ExampleService } from './example.service';

@Controller('example')
export class ExampleController {
  public constructor(private readonly exampleService: ExampleService) {}

  @Get('example')
  public getExample(): string {
    return this.exampleService.getExample();
  }

  @Get('node-env')
  public getNodeEnv(): string {
    return this.exampleService.getNodeEnv();
  }

  @Get('db')
  public async getDb(): Promise<string> {
    return this.exampleService.getDb();
  }
}
