import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { ConfigOptions } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoggerMessage = any;

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logLevelState: LogLevelState;

  public constructor(configService: ConfigService) {
    const configOptions = configService.configOptions;
    this.logLevelState = getLogLevelState(configOptions);
  }

  public log(message: LoggerMessage): void {
    this.info(message);
  }

  public error(message: LoggerMessage): void {
    if (!this.isError) {
      return;
    }

    console.error(message);
  }

  public warn(message: LoggerMessage): void {
    if (!this.isWarn) {
      return;
    }

    console.warn(message);
  }

  public info(message: LoggerMessage): void {
    if (!this.isInfo) {
      return;
    }

    console.info(message);
  }

  public debug(message: LoggerMessage): void {
    if (!this.isDebug) {
      return;
    }

    console.debug(message);
  }

  public verbose(message: LoggerMessage): void {
    if (!this.isVerbose) {
      return;
    }

    console.debug(message);
  }

  public get isError(): boolean {
    return this.logLevelState.isError;
  }

  public get isWarn(): boolean {
    return this.logLevelState.isWarn;
  }

  public get isInfo(): boolean {
    return this.logLevelState.isInfo;
  }

  public get isDebug(): boolean {
    return this.logLevelState.isDebug;
  }

  public get isVerbose(): boolean {
    return this.logLevelState.isVerbose;
  }

  // public setLogLevels?(levels: LogLevel[]) {
  //   throw new Error('Method not implemented.');
  // }
}

interface LogLevelState {
  readonly isError: boolean;
  readonly isWarn: boolean;
  readonly isInfo: boolean;
  readonly isDebug: boolean;
  readonly isVerbose: boolean;
}

function getLogLevelState(configOptions: ConfigOptions): LogLevelState {
  const logLevel = configOptions.logLevel;
  const isVerbose = logLevel === 'verbose';
  const isDebug = isVerbose || logLevel === 'debug';
  const isInfo = isDebug || logLevel === 'info';
  const isWarn = isInfo || logLevel === 'warn';
  const isError = isWarn || logLevel === 'error';

  return {
    isError,
    isWarn,
    isInfo,
    isDebug,
    isVerbose,
  };
}
