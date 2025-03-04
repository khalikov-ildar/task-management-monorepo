import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { createTemplateWithGivenUrl } from '../mailer/assets/templates';
import { Inbox } from './inbox';
import { Repository } from 'typeorm';
import { MailerService } from '../mailer/mailer.service';
import { EmailConfirmationEventPayload, PasswordResetRequestEventPayload, PasswordResetSuccessEventPayload } from '@app/contracts';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class InboxProcessor {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(
    @InjectRepository(Inbox) private readonly inboxRepo: Repository<Inbox>,
    private readonly mailerService: MailerService,
  ) {}

  @Interval(10000)
  async handleInboxMessages() {
    const messages = await this.inboxRepo.find({ where: { isProcessed: false }, take: 50, order: { createdAt: 'ASC' } });

    for (const message of messages) {
      try {
        switch (message.type) {
          case 'emailConfirmation':
            const emailPayload = message.payload as EmailConfirmationEventPayload;
            const emailTemplate = this.getEmailConfirmationTemplate(emailPayload);
            await this.mailerService.sendMessage(emailPayload.userEmail, { htmlTemplate: emailTemplate, subject: 'Confirm email' });
            break;
          case 'passwordResetRequest':
            const requestPayload = message.payload as PasswordResetRequestEventPayload;
            const requestTemplate = this.getPasswordResetRequestTemplate(requestPayload);
            await this.mailerService.sendMessage(requestPayload.userEmail, {
              htmlTemplate: requestTemplate,
              subject: 'Your password reset ',
            });
          case 'passwordResetSuccess':
            const successPayload = message.payload as PasswordResetSuccessEventPayload;
            const successTemplate = this.getPasswordResetSuccessTemplate();
            await this.mailerService.sendMessage(successPayload.userEmail, {
              htmlTemplate: successTemplate,
              subject: 'Your password changed',
            });
        }
        await this.inboxRepo.update({ id: message.id }, { isProcessed: true });
      } catch (e) {
        throw e;
      }
    }
  }

  private getEmailConfirmationTemplate(payload: EmailConfirmationEventPayload) {
    return createTemplateWithGivenUrl(this.baseUrl, 'emailConfirmation', payload.tokenId);
  }

  private getPasswordResetRequestTemplate(payload: PasswordResetRequestEventPayload) {
    return createTemplateWithGivenUrl(this.baseUrl, 'passwordResetRequest', payload.tokenId);
  }

  private getPasswordResetSuccessTemplate() {
    return createTemplateWithGivenUrl(this.baseUrl, 'passwordResetSuccess');
  }
}
