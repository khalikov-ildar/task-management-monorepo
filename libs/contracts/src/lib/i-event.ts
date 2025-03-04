import { UUID } from 'node:crypto';

export interface IEvent<T extends IEventPayload> {
  event: string;
  payload: T;
}

export type IEventPayload = { userId: UUID };
