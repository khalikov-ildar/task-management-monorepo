import { IEvent, IEventPayload } from '@app/contracts';
import { IEventPublisher } from '../../../../application/common/services/i-event-publisher';
import { AlsProvider } from '../async-local-storage/als.provider';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

export const RmqClientInjectionToken = 'RmqClientInjectionToken';

export class RmqEventPublisher implements IEventPublisher {
  constructor(
    private readonly client: ClientProxy,
    private readonly alsProvider: AlsProvider,
  ) {}

  async publish(event: IEvent<IEventPayload>): Promise<void> {
    const traceId = this.alsProvider.getValue('traceId');
    const record = new RmqRecordBuilder(event.payload)
      .setOptions({
        headers: {
          ['traceId']: traceId,
        },
      })
      .build();
    await lastValueFrom(this.client.emit(event.event, record));
  }
}
