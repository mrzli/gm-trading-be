import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './app-logger.service';

@Global()
@Module({
  imports: [],
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggerModule {}
