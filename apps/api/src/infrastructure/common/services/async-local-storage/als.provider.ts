import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { AlsStore, AlsStructure } from './als-store.type';

@Injectable()
export class AlsProvider {
  private readonly als: AsyncLocalStorage<AlsStore>;
  constructor() {
    this.als = new AsyncLocalStorage();
  }

  getValue<T extends keyof AlsStructure>(key: T): AlsStructure[T] {
    return this.als.getStore()?.get(key) as AlsStructure[T];
  }

  setValue<T extends keyof AlsStructure>(key: T, value: AlsStructure[T]): typeof this {
    const store = this.als.getStore();
    store.set(key, value);
    return this;
  }

  run(store: AlsStore, callback: () => unknown) {
    this.als.run(store, callback);
  }
}
