import { CustomError } from 'apps/api/src/domain/common/error/custom-error';
import { PasswordResetToken } from 'apps/api/src/domain/entities/tokens/password-reset-token';
import { User } from 'apps/api/src/domain/entities/user/user';
import { IPasswordTokenRepository } from 'apps/api/src/domain/repositories/tokens/i-password-token.repository';
import { IUserRepository } from 'apps/api/src/domain/repositories/user/i-user.repository';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../common/errors/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ILogger } from '../../../common/services/i-logger';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { maskEmail } from '../../../common/utils/mask-email';
import { IPasswordTokenProvider } from '../../services/i-password-token.provider';
import { PasswordResetRequestCommand } from './password-reset-request.command';
import { IEventPublisher } from '../../../common/services/i-event-publisher';
import { createPasswordResetRequestEvent } from '@app/contracts';

export class PasswordResetRequestUseCase implements IUseCase<PasswordResetRequestCommand, void> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordTokenProvider: IPasswordTokenProvider,
    private readonly transactionManager: ITransactionManager,
    private readonly passwordTokenRepository: IPasswordTokenRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly logger: ILogger,
  ) {}

  async execute(request: PasswordResetRequestCommand): Promise<Result<void, CustomError>> {
    const context = PasswordResetRequestUseCase.name;
    const maskedEmail = maskEmail(request.email);

    this.logger.logInfo('Attempt to create password reset token', { context, email: maskedEmail });

    const getUserResult = await this.getUser(request.email, maskedEmail, context);

    if (getUserResult.isErr()) {
      return err(getUserResult.error);
    }

    const user = getUserResult.value;

    if (!user) {
      this.logger.logInfo('Attempt to reset password for non-existent user detected', { context });
      return ok(undefined);
    }

    let token: string;
    try {
      token = await this.passwordTokenProvider.signPasswordToken({ sub: user.id });
    } catch (e) {
      this.logger.logError('An error occurred while trying to sign the password token', { context }, e);
      return err(UnexpectedError.create());
    }

    const resetToken = new PasswordResetToken(token, user.id);

    try {
      await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Transaction started for saving token and sending message', { context });

        try {
          await this.passwordTokenRepository.create(resetToken, tx);
        } catch (e) {
          this.logger.logError('An error occurred while trying to save the token', { context }, e);
          throw e;
        }

        await this.eventPublisher.publish(createPasswordResetRequestEvent(user.id, user.email, resetToken.id));

        this.logger.logInfo('Transaction completed successfully', { context });
      });
    } catch (e) {
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Successfully created password reset token', { context, email: maskedEmail });

    return ok(undefined);
  }

  private async getUser(email: string, maskedEmail: string, context: string): Promise<Result<User | null, CustomError>> {
    try {
      const user = await this.userRepository.getByEmail(email);
      return ok(user);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch user', { context }, e);
      return err(UnexpectedError.create());
    }
  }
}
