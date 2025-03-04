import { CustomError } from '../../../../domain/common/error/custom-error';
import { PasswordResetToken } from '../../../../domain/entities/tokens/password-reset-token';
import { User } from '../../../../domain/entities/user/user';
import { IPasswordTokenRepository } from '../../../../domain/repositories/tokens/i-password-token.repository';
import { IUserRepository } from '../../../../domain/repositories/user/i-user.repository';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../../domain/common/error/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ILogger } from '@app/shared';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { maskEmail } from '../../../common/utils/mask-email';
import { IPasswordTokenProvider } from '../../services/i-password-token.provider';
import { PasswordResetRequestCommand } from './password-reset-request.command';
import { IEventPublisher } from '../../../common/services/i-event-publisher';
import { createPasswordResetRequestEvent } from '@app/contracts';
import { ContextualLogger } from '../../../common/services/contextual-logger';

export class PasswordResetRequestUseCase implements IUseCase<PasswordResetRequestCommand, void> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordTokenProvider: IPasswordTokenProvider,
    private readonly transactionManager: ITransactionManager,
    private readonly passwordTokenRepository: IPasswordTokenRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly _genericlogger: ILogger,
  ) {}

  private readonly logger = new ContextualLogger(PasswordResetRequestUseCase.name, this._genericlogger);

  async execute(request: PasswordResetRequestCommand): Promise<Result<void, CustomError>> {
    const maskedEmail = maskEmail(request.email);

    this.logger.logInfo('Attempt to create password reset token', { email: maskedEmail });

    const handleUserFetchingResult = await this.handleUserFetching(request.email);

    if (handleUserFetchingResult.isErr()) {
      return err(handleUserFetchingResult.error);
    }

    const user = handleUserFetchingResult.value;

    if (!user) {
      this.logger.logInfo('Attempt to reset password for non-existent user detected', {});
      return ok(undefined);
    }

    let token: string;
    try {
      token = await this.passwordTokenProvider.signPasswordToken({ sub: user.id });
    } catch (e) {
      this.logger.logError('An error occurred while trying to sign the password token', {}, e);
      return err(UnexpectedError.create());
    }

    const resetToken = new PasswordResetToken(token, user.id);

    try {
      await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Transaction started for saving token and sending message', {});

        try {
          await this.passwordTokenRepository.create(resetToken, tx);
        } catch (e) {
          this.logger.logError('An error occurred while trying to save the token', {}, e);
          throw e;
        }

        await this.eventPublisher.publish(createPasswordResetRequestEvent(user.id, user.email, resetToken.id));

        this.logger.logInfo('Transaction completed successfully', {});
      });
    } catch (e) {
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Successfully created password reset token', { email: maskedEmail });

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
}
