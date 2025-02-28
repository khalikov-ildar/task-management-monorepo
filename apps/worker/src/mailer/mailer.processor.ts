import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inbox } from '../inbox/models/inbox';
import { Repository } from 'typeorm';
import { MailerService } from './mailer.service';
import { PasswordResetRequestEvent } from '@app/contracts';

@Injectable()
export class MailerProcessor {
  constructor(
    @InjectRepository(Inbox) private readonly inboxRepository: Repository<Inbox>,
    private readonly mailerService: MailerService,
  ) {}

  async sendEmailConfirmation(event: PasswordResetRequestEvent) {
    const inbox = this.inboxRepository.create();
    inbox.event = event;
    inbox.type = 'emailConfirmation';
    await this.inboxRepository.save(inbox);
  }
}
