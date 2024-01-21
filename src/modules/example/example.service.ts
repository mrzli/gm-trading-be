import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { UserRepository } from '../db/repositories';

@Injectable()
export class ExampleService {
  public constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {}

  public getExample(): string {
    return 'Hello World!';
  }

  public getNodeEnv(): string {
    return this.configService.configOptions.nodeEnv;
  }

  public async getDb(): Promise<string> {
    const result = await this.userRepository.findOneOrThrow(1);
    console.log(result);
    return JSON.stringify(result);
  }
}
