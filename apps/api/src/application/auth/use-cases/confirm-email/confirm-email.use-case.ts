import { CustomError } from 'apps/api/src/domain/common/error/custom-error';
import { err, ok, Result } from 'neverthrow';
import { IUseCase } from '../../../common/i-use-case';
import { ConfirmEmailCommand } from './confirm-email.command';
import { IEmailTokenRepository } from 'apps/api/src/domain/repositories/tokens/i-email-token.repository';
import { IEmailTokenProvider } from '../../services/i-email-token.provider';
import { IUserRepository } from 'apps/api/src/domain/repositories/user/i-user.repository';
import { ILogger } from '../../../common/services/i-logger';
import { UUID } from 'node:crypto';
import { EmailVerificationToken } from 'apps/api/src/domain/entities/tokens/email-verification-token';
import { EmailTokensErrors } from 'apps/api/src/domain/errors/tokens/email-token.errors';
import { EmailTokenType } from '../../dtos/email-token-type';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { UnexpectedError } from '../../../common/errors/unexpected-error';
import { maskEmail } from '../../../common/utils/mask-email';

export class ConfirmEmailUseCase implements IUseCase<ConfirmEmailCommand, void> {
  constructor(
    private readonly emailTokenRepository: IEmailTokenRepository,
    private readonly emailTokenProvider: IEmailTokenProvider,
    private readonly userRepository: IUserRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly logger: ILogger,
  ) {}

  async execute(request: ConfirmEmailCommand): Promise<Result<void, CustomError>> {
    const context = ConfirmEmailUseCase.name;
    this.logger.logInfo('Attempt to confirm email', { context, tokenId: request.tokenId });

    const emailTokenFetchingResult = await this.handleEmailTokenFetching(request.tokenId, context);
    if (emailTokenFetchingResult.isErr()) {
      return err(emailTokenFetchingResult.error);
    }

    const emailToken = emailTokenFetchingResult.value;

    const emailTokenValidationResult = await this.handleEmailTokenValidation(emailToken, context);
    if (emailTokenValidationResult.isErr()) {
      return err(emailTokenValidationResult.error);
    }

    const { email } = emailTokenValidationResult.value;

    try {
      await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Started transaction for email confirmation', { context });

        await this.handleUserActivation(email, emailToken.id, tx, context);

        this.logger.logInfo('Transaction successfully finished', { context });
      });
    } catch (e) {
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Email successfully confirmed', { context, email: maskEmail(email) });

    return ok(undefined);
  }

  private async handleEmailTokenFetching(id: UUID, context: string): Promise<Result<EmailVerificationToken, CustomError>> {
    let token: EmailVerificationToken | null;
    try {
      token = await this.emailTokenRepository.getById(id);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch the email token', { context }, e);
      return err(UnexpectedError.create());
    }

    if (!token) {
      return err(EmailTokensErrors.tokenExpiredOrWasNotFound());
    }

    return ok(token);
  }

  private async handleEmailTokenValidation(token: EmailVerificationToken, context: string): Promise<Result<EmailTokenType, CustomError>> {
    let email: EmailTokenType;
    try {
      email = await this.emailTokenProvider.verifyEmailToken(token.token);
    } catch (e) {
      this.logger.logInfo('Attempt to use expired email verification token detected', { context, tokenId: token.id });
      return err(EmailTokensErrors.tokenExpiredOrWasNotFound());
    }

    return ok(email);
  }

  private async handleUserActivation(email: string, tokenId: UUID, tx: any, context: string): Promise<void> {
    const changeEmailConfirmationByEmail = this.userRepository.changeEmailConfirmationByEmail(email, true, tx);
    const deleteToken = this.emailTokenRepository.deleteById(tokenId, tx);

    try {
      await Promise.all([changeEmailConfirmationByEmail, deleteToken]);
    } catch (e) {
      this.logger.logError('An error occurred while  trying to activate user or delete the email token', { context }, e);
      throw e;
    }
  }
}
