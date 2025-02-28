import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { ILogger } from '../../../../application/common/services/i-logger';
import pino from 'pino';
import { AlsProvider } from '../async-local-storage/als.provider';

@Injectable()
export class PinoLogger implements LoggerService, ILogger {
  private readonly logger = pino({
    level: 'info',
    timestamp: pino.stdTimeFunctions.epochTime,
  });

  constructor(private readonly alsProvider: AlsProvider) {}

  private logWithContext(
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
    message: any,
    context: Record<string, unknown>,
    error?: Error,
  ): void {
    if (typeof context === 'string') {
      const logObject = error ? { context, stack: error.stack } : { context };
      this.logger[level](logObject, message);
    } else {
      const traceId = this.alsProvider?.getValue('traceId');
      const ip = this.alsProvider?.getValue('maskedIp');
      const path = this.alsProvider?.getValue('path');
      const logObject = error ? { traceId, ip, path, ...context, stack: error.stack } : { traceId, ip, path, ...context };
      this.logger[level](logObject, message);
    }
  }
  logTrace(message: string, context: Record<string, unknown>, error?: Error): void {
    this.logWithContext('trace', message, context, error);
  }

  logDebug(message: string, context: Record<string, unknown>, error?: Error): void {
    this.logWithContext('debug', message, context, error);
  }

  logInfo(message: string, context: Record<string, unknown>, error?: Error): void {
    this.logWithContext('info', message, context, error);
  }

  logWarn(message: string, context: Record<string, unknown>, error?: Error): void {
    this.logWithContext('warn', message, context, error);
  }
  logError(message: string, context: Record<string, unknown>, error?: Error): void {
    this.logWithContext('error', message, context, error);
  }
  logFatal(message: string, context: Record<string, unknown>, error?: Error): void {
    this.logWithContext('fatal', message, context, error);
  }

  verbose(message: any, ...optionalParams: [Record<string, unknown>?, Error?]): void {
    const [context = {}, error] = optionalParams;
    this.logTrace(message, context, error);
  }

  debug(message: any, ...optionalParams: [Record<string, unknown>?, Error?]): void {
    const [context = {}, error] = optionalParams;
    this.logDebug(message, context, error);
  }

  log(message: any, ...optionalParams: [Record<string, unknown>?, Error?]): void {
    const [context = {}, error] = optionalParams;
    this.logInfo(message, context, error);
  }

  warn(message: any, ...optionalParams: [Record<string, unknown>?, Error?]): void {
    const [context = {}, error] = optionalParams;
    this.logWarn(message, context, error);
  }

  error(message: any, ...optionalParams: [Record<string, unknown>?, Error?]): void {
    const [context = {}, error] = optionalParams;
    this.logError(message, context, error);
  }

  fatal(message: any, ...optionalParams: [Record<string, unknown>?, Error?]): void {
    const [context = {}, error] = optionalParams;
    this.logFatal(message, context, error);
  }

  setLogLevels(levels: LogLevel[]): void {
    let minLevel: pino.Level = 'info';

    if (levels.length > 0) {
      const validLevels: pino.Level[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
      minLevel = validLevels.find((level) => levels.includes(level as LogLevel)) || 'info';
    }

    this.logger.level = minLevel;
  }
}
