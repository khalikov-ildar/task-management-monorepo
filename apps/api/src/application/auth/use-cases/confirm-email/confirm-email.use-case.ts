import { CustomError } from '../../../../domain/common/error/custom-error';
import { err, ok, Result } from 'neverthrow';
import { IUseCase } from '../../../common/i-use-case';
import { ConfirmEmailCommand } from './confirm-email.command';
import { IEmailTokenRepository } from '../../../../domain/repositories/tokens/i-email-token.repository';
import { IEmailTokenProvider } from '../../services/i-email-token.provider';
import { IUserRepository } from '../../../../domain/repositories/user/i-user.repository';
import { ILogger } from '@app/shared';
import { UUID } from 'node:crypto';
import { EmailVerificationToken } from '../../../../domain/entities/tokens/email-verification-token';
import { EmailTokensErrors } from '../../../../domain/errors/tokens/email-token.errors';
import { EmailTokenType } from '../../dtos/email-token-type';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { UnexpectedError } from '../../../../domain/common/error/unexpected-error';
import { maskEmail } from '../../../common/utils/mask-email';
import { ContextualLogger } from '../../../common/services/contextual-logger';

export class ConfirmEmailUseCase implements IUseCase<ConfirmEmailCommand, void> {
  constructor(
    private readonly emailTokenRepository: IEmailTokenRepository,
    private readonly emailTokenProvider: IEmailTokenProvider,
    private readonly userRepository: IUserRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly _genericLogger: ILogger,
  ) {}

  private readonly logger = new ContextualLogger(ConfirmEmailUseCase.name, this._genericLogger);

  async execute(request: ConfirmEmailCommand): Promise<Result<void, CustomError>> {
    this.logger.logInfo('Attempt to confirm email', { tokenId: request.tokenId });

    const emailTokenFetchingResult = await this.handleEmailTokenFetching(request.tokenId);
    if (emailTokenFetchingResult.isErr()) {
      return err(emailTokenFetchingResult.error);
    }

    const emailToken = emailTokenFetchingResult.value;

    const emailTokenValidationResult = await this.handleEmailTokenValidation(emailToken);
    if (emailTokenValidationResult.isErr()) {
      return err(emailTokenValidationResult.error);
    }

    const { email } = emailTokenValidationResult.value;

    try {
      await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Started transaction for email confirmation', {});

        await this.handleUserActivation(email, emailToken.id, tx);

        this.logger.logInfo('Transaction successfully finished', {});
      });
    } catch (e) {
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Email successfully confirmed', { email: maskEmail(email) });

    return ok(undefined);
  }

  private async handleEmailTokenFetching(id: UUID): Promise<Result<EmailVerificationToken, CustomError>> {
    let token: EmailVerificationToken | null;
    try {
      token = await this.emailTokenRepository.getById(id);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch the email token', {}, e);
      return err(UnexpectedError.create());
    }

    if (!token) {
      return err(EmailTokensErrors.tokenExpiredOrWasNotFound());
    }

    return ok(token);
  }

  private async handleEmailTokenValidation(token: EmailVerificationToken): Promise<Result<EmailTokenType, CustomError>> {
    let email: EmailTokenType;
    try {
      email = await this.emailTokenProvider.verifyEmailToken(token.token);
    } catch (e) {
      this.logger.logInfo('Attempt to use expired email verification token detected', { tokenId: token.id });
      return err(EmailTokensErrors.tokenExpiredOrWasNotFound());
    }

    return ok(email);
  }

  private async handleUserActivation(email: string, tokenId: UUID, tx: any): Promise<void> {
    const changeEmailConfirmationByEmail = this.userRepository.changeEmailConfirmationByEmail(email, true, tx);
    const deleteToken = this.emailTokenRepository.deleteById(tokenId, tx);

    try {
      await Promise.all([changeEmailConfirmationByEmail, deleteToken]);
    } catch (e) {
      this.logger.logError('An error occurred while  trying to activate user or delete the email token', {}, e);
      throw e;
    }
  }
}
