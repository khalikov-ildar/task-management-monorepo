import { ILogger } from '@app/shared';

export class ContextualLogger implements ILogger {
  constructor(
    private readonly executionContext: string,
    private readonly logger: ILogger,
  ) {}
  logTrace(message: string, context: Record<string, unknown>, error?: Error): void {
    this.logger.logTrace(message, { context: this.executionContext, ...context }, error);
  }
  logDebug(message: string, context: Record<string, unknown>, error?: Error): void {
    this.logger.logDebug(message, { context: this.executionContext, ...context }, error);
  }
  logInfo(message: string, context: Record<string, unknown>, error?: Error): void {
    this.logger.logInfo(message, { context: this.executionContext, ...context }, error);
  }
  logWarn(message: string, context: Record<string, unknown>, error?: Error): void {
    this.logger.logWarn(message, { context: this.executionContext, ...context }, error);
  }
  logError(message: string, context: Record<string, unknown>, error?: Error): void {
    this.logger.logError(message, { context: this.executionContext, ...context }, error);
  }
  logFatal(message: string, context: Record<string, unknown>, error: Error): void {
    this.logger.logFatal(message, { context: this.executionContext, ...context }, error);
  }
}
