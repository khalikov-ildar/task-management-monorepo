import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  PasswordResetRequestEventName,
  PasswordResetRequestEventPayload,
  EmailConfirmationEventName,
  EmailConfirmationEventPayload,
  PasswordResetSuccessEventName,
  PasswordResetSuccessEventPayload,
} from '@app/contracts';
import { InboxService } from '../inbox/inbox.service';
import { ILogger } from '@app/shared';

@Controller()
export class MailerController {
  constructor(
    private readonly inboxService: InboxService,
    private readonly logger: ILogger,
  ) {}

  @EventPattern(EmailConfirmationEventName)
  async handleEmailConfirmation(@Payload() data: EmailConfirmationEventPayload, @Ctx() ctx: RmqContext) {
    await this.handleAck(() => this.inboxService.processSave(data, EmailConfirmationEventName), ctx, EmailConfirmationEventName);
  }

  @EventPattern(PasswordResetRequestEventName)
  async handlePasswordResetRequest(@Payload() data: PasswordResetRequestEventPayload, @Ctx() ctx: RmqContext) {
    await this.handleAck(() => this.inboxService.processSave(data, PasswordResetRequestEventName), ctx, PasswordResetRequestEventName);
  }

  @EventPattern(PasswordResetSuccessEventName)
  async handlePasswordResetSuccess(@Payload() data: PasswordResetSuccessEventPayload, @Ctx() ctx: RmqContext) {
    await this.handleAck(() => this.inboxService.processSave(data, PasswordResetSuccessEventName), ctx, PasswordResetRequestEventName);
  }

  private async handleAck(fn: () => Promise<void>, ctx: RmqContext, eventName: string) {
    const context = MailerController.name;
    const channel = ctx.getChannelRef();
    const message = ctx.getMessage();
    const traceId = message.properties.headers['traceId'];

    try {
      this.logger.logInfo('Attempt to process the event', { context, event: eventName, traceId });
      await fn();
      channel.ack(message);
    } catch (e) {
      this.logger.logError('An error occured while trying to save event', { context, event: eventName, traceId }, e);
      channel.nack(message);
    }
  }
}
