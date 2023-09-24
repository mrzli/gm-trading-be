import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class ExampleService {
  public constructor(private readonly configService: ConfigService) {}

  public getExample(): string {
    return 'Hello World!';
  }

  public getNodeEnv(): string {
    return this.configService.configOptions.nodeEnv;
  }
}
