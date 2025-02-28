export abstract class ITransactionManager {
  abstract execute<T>(fn: (tx: any) => Promise<T>): Promise<T>;
}
