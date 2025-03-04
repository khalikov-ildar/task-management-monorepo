import { CustomError } from '../../../../domain/common/error/custom-error';
import { err, ok, Result } from 'neverthrow';
import { IUseCase } from '../../../common/i-use-case';
import { SendEmailConfirmationCommand } from './send-email-confirmation.command';
import { IUserRepository } from '../../../../domain/repositories/user/i-user.repository';
import { ILogger } from '@app/shared';
import { maskEmail } from '../../../common/utils/mask-email';
import { User } from '../../../../domain/entities/user/user';
import { UnexpectedError } from '../../../../domain/common/error/unexpected-error';
import { IEmailTokenProvider } from '../../services/i-email-token.provider';
import { IEmailTokenRepository } from '../../../../domain/repositories/tokens/i-email-token.repository';
import { IEventPublisher } from '../../../common/services/i-event-publisher';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { UUID } from 'node:crypto';
import { EmailVerificationToken } from '../../../../domain/entities/tokens/email-verification-token';
import { createEmailConfirmationEvent } from '@app/contracts';
import { ContextualLogger } from '../../../common/services/contextual-logger';

export class SendEmailConfirmationUseCase implements IUseCase<SendEmailConfirmationCommand, void> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailTokenProvider: IEmailTokenProvider,
    private readonly emailTokenRepository: IEmailTokenRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly transactionManager: ITransactionManager,
    private readonly _genericLogger: ILogger,
  ) {}

  private readonly logger = new ContextualLogger(SendEmailConfirmationUseCase.name, this._genericLogger);

  async execute(request: SendEmailConfirmationCommand): Promise<Result<void, CustomError>> {
    const maskedEmail = maskEmail(request.email);
    this.logger.logInfo('Attempt to request email confirmation', { email: maskedEmail });

    const userFetchingResult = await this.handleUserFetching(request.email);
    if (userFetchingResult.isErr()) {
      return err(userFetchingResult.error);
    }
    const user = userFetchingResult.value;

    if (!user) {
      this.logger.logInfo('Attempt to request verification email for non-existent user detected', {});
      return ok(undefined);
    }

    if (user.isEmailConfirmed) {
      return ok(undefined);
    }

    const emailTokenFetchingResult = await this.handleEmailTokenFetching(request.email);
    if (emailTokenFetchingResult.isErr()) {
      return err(emailTokenFetchingResult.error);
    }

    const existingEmailToken = emailTokenFetchingResult.value;

    if (existingEmailToken) {
      const validaitonResult = await this.handleEmailTokenValidation(existingEmailToken.token);
      if (validaitonResult.isOk()) {
        try {
          await this.eventPublisher.publish(createEmailConfirmationEvent(user.id, user.email, existingEmailToken.id));
          return ok(undefined);
        } catch (e) {
          this.logger.logError('An error occured while trying to publish email confirmation event', {}, e);
          return err(UnexpectedError.create());
        }
      }
    }

    try {
      await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Started transaction for email token generation', {});

        try {
          await this.handleEventTokenGeneration(user.email, user.id, tx);
        } catch (e) {
          this.logger.logError('An error occurred while trying to generate and save the email token', {}, e);
          throw e;
        }

        this.logger.logInfo('Successfully finished transaction', {});
      });
    } catch (e) {
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Email confirmation request handled successfully', { email: maskedEmail });

    return ok(undefined);
  }

  private async handleUserFetching(email: string): Promise<Result<User | null, CustomError>> {
    try {
      const user = await this.userRepository.getByEmail(email);
      return ok(user);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch user', {}, e);
      return err(UnexpectedError.create());
    }
  }

  private async handleEmailTokenFetching(email: string): Promise<Result<EmailVerificationToken | null, CustomError>> {
    try {
      const emailToken = await this.emailTokenRepository.getByEmail(email);
      return ok(emailToken);
    } catch (e) {
      this.logger.logError('An error occured while trying to fetch email token', {}, e);
      return err(UnexpectedError.create());
    }
  }

  private async handleEmailTokenValidation(token: string): Promise<Result<void, void>> {
    try {
      await this.emailTokenProvider.verifyEmailToken(token);
      return ok(undefined);
    } catch (e) {
      return err(undefined);
    }
  }

  private async handleEventTokenGeneration(email: string, id: UUID, tx?: any) {
    const emailToken = await this.emailTokenProvider.signEmailToken(email);
    const emailEntity = new EmailVerificationToken(id, email, emailToken);

    await this.emailTokenRepository.save(emailEntity, tx);

    await this.eventPublisher.publish(createEmailConfirmationEvent(id, email, emailEntity.id));
  }
}
