import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { MailerOptions } from './interfaces/mailer-options.interface';
import { EmailMessageContent } from './email-message-content';

@Injectable()
export class MailerService {
  private readonly transporter: Transporter;
  private readonly senderAddress: string;

  constructor(options: MailerOptions) {
    this.transporter = createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      auth: options.auth,
    });
    this.senderAddress = options.senderAddress;
  }

  async sendMessage(email: string, messageContent: EmailMessageContent): Promise<void> {
    await this.transporter.sendMail({
      from: this.senderAddress,
      to: email,
      subject: messageContent.subject,
      html: messageContent.htmlTemplate,
    });
  }
}
