import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  PasswordResetRequestEventName,
  PasswordResetRequestEventPayload,
  EmailConfirmationEventName,
  EmailConfirmationEventPayload,
} from '@app/contracts';
import { MailerProcessor } from './mailer.processor';

@Controller()
export class MailerController {
  constructor(private readonly mailerProcessor: MailerProcessor) {}

  @EventPattern(EmailConfirmationEventName)
  async handleEmailConfirmation(@Payload() data: EmailConfirmationEventPayload, @Ctx() ctx: RmqContext) {}

  @EventPattern(PasswordResetRequestEventName)
  async handlePasswordResetRequest(@Payload() data: PasswordResetRequestEventPayload, @Ctx() ctx: RmqContext) {}
}
