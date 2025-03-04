import { IEvent, IEventPayload } from '@app/contracts';

export abstract class IEventPublisher {
  abstract publish<T extends IEvent<IEventPayload>>(event: T): Promise<void>;
}
