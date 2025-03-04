import { Injectable } from '@nestjs/common';
import {
  EmailConfirmationEventPayload,
  IEventPayload,
  PasswordResetRequestEventPayload,
  PasswordResetSuccessEventPayload,
} from '@app/contracts';
import { Events } from '../mailer/events.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Inbox } from './inbox';
import { Repository } from 'typeorm';
import { InboxTypes } from './inbox.types';

@Injectable()
export class InboxService {
  private readonly strategies: Record<Events, (payload: unknown) => Promise<void>> = {
    [Events.EmailConfirmationEventName]: this.saveEmailConfirmation,
    [Events.PasswordResetRequestEventName]: this.savePasswordResetRequest,
    [Events.PasswordResetSuccessEventName]: this.savePasswordResetSuccess,
  };

  constructor(@InjectRepository(Inbox) private readonly inboxRepository: Repository<Inbox>) {
    this.saveEmailConfirmation = this.saveEmailConfirmation.bind(this);
    this.savePasswordResetRequest = this.savePasswordResetRequest.bind(this);
    this.savePasswordResetSuccess = this.savePasswordResetSuccess.bind(this);
  }

  public async processSave(payload: unknown, eventName: Events): Promise<void> {
    await this.strategies[eventName](payload);
  }

  private async saveEmailConfirmation(payload: EmailConfirmationEventPayload): Promise<void> {
    await this.inboxRepository.save(this.createInbox('emailConfirmation', payload));
  }

  private async savePasswordResetRequest(payload: PasswordResetRequestEventPayload): Promise<void> {
    await this.inboxRepository.save(this.createInbox('passwordResetRequest', payload));
  }

  private async savePasswordResetSuccess(payload: PasswordResetSuccessEventPayload): Promise<void> {
    await this.inboxRepository.save(this.createInbox('passwordResetSuccess', payload));
  }

  private createInbox<T extends IEventPayload>(type: InboxTypes, payload: T): Inbox {
    const inbox = this.inboxRepository.create();
    inbox.type = type;
    inbox.payload = payload;
    inbox.userId = payload.userId;
    return inbox;
  }
}
