import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Inbox } from './models/inbox';
import { Repository } from 'typeorm';
import { MailerService } from '../mailer/mailer.service';
import { InboxTypes } from './inbox.types';
import { createTemplateWithGivenUrl, Templates } from '../mailer/assets/templates';
import { getEventPayloadByInboxType } from './utils';

@Injectable()
export class InboxProcessor {
  private readonly messageTypeToTemplateMap: Record<InboxTypes, Templates> = {
    emailConfirmation: Templates.emailConfirmationTemplate,
    passwordResetRequest: Templates.passwordResetRequestTemplate,
  };

  constructor(
    @InjectRepository(Inbox) private readonly inboxRepository: Repository<Inbox>,
    private readonly mailerService: MailerService,
  ) {}

  @Interval(10000)
  async handleInboxMessages() {
    const messages = await this.inboxRepository.find({ where: { processed: false }, take: 100, order: { createdAt: 'ASC' } });

    for (const message of messages) {
      const template = this.messageTypeToTemplateMap[message.type];
      const payload = getEventPayloadByInboxType(message.type, message.event);
      try {
        await this.mailerService.sendMessage(payload.userEmail, {
          htmlTemplate: createTemplateWithGivenUrl(`http://localhost:3000/confirm-email/${payload.tokenId}`, template),
          subject: 'Confirm email please',
        });
        message.processed = true;
        await this.inboxRepository.update({ id: message.id }, message);
      } catch (e) {}
    }
  }
}
