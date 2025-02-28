import { IEvent } from '@app/contracts';

export abstract class IEventPublisher {
  abstract publish<T extends IEvent>(event: T): Promise<void>;
}
