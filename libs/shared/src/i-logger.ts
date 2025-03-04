export abstract class ILogger {
  abstract logTrace(message: string, context: Record<string, unknown>, error?: Error): void;
  abstract logDebug(message: string, context: Record<string, unknown>, error?: Error): void;
  abstract logInfo(message: string, context: Record<string, unknown>, error?: Error): void;
  abstract logWarn(message: string, context: Record<string, unknown>, error?: Error): void;
  abstract logError(message: string, context: Record<string, unknown>, error?: Error): void;
  abstract logFatal(message: string, context: Record<string, unknown>, error: Error): void;
}
