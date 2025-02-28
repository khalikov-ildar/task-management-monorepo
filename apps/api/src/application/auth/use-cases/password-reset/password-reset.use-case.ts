import { CustomError } from '../../../../domain/common/error/custom-error';
import { PasswordResetToken } from '../../../../domain/entities/tokens/password-reset-token';
import { IPasswordTokenRepository } from '../../../../domain/repositories/tokens/i-password-token.repository';
import { IUserRepository } from '../../../../domain/repositories/user/i-user.repository';
import { UUID } from 'node:crypto';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../common/errors/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ILogger } from '../../../common/services/i-logger';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { IPasswordTokenProvider } from '../../services/i-password-token.provider';
import { IPasswordHasher } from '../../services/i-password.hasher';
import { PasswordResetCommand } from './password-reset.command';
import { PasswordTokenErrors } from '../../../../domain/errors/tokens/password-token.errors';

export class PasswordResetUseCase implements IUseCase<PasswordResetCommand, void> {
  private userId: UUID;

  constructor(
    private readonly passwordTokenRepository: IPasswordTokenRepository,
    private readonly passwordTokenProvider: IPasswordTokenProvider,
    private readonly passwordHasher: IPasswordHasher,
    private readonly userRepository: IUserRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly logger: ILogger,
  ) {}

  async execute(request: PasswordResetCommand): Promise<Result<void, CustomError>> {
    const context = PasswordResetUseCase.name;
    const tokenId = request.tokenId;

    this.logger.logInfo('Attempt to reset the password', { context, tokenId });

    const existingTokenVerificationResult = await this.handleExistingTokenVerification(tokenId, context);

    if (existingTokenVerificationResult.isErr()) {
      return err(existingTokenVerificationResult.error);
    }

    const existingToken = existingTokenVerificationResult.value;

    try {
      const payload = await this.passwordTokenProvider.verifyPasswordToken(existingToken.token);
      this.provideUserId(payload.sub);
    } catch (e) {
      this.logger.logWarn('Provided invalid or expired reset token', { context, tokenId });
      return err(PasswordTokenErrors.expired());
    }

    let hashedNewPassword: string;
    try {
      hashedNewPassword = await this.passwordHasher.hash(request.newPassword);
    } catch (e) {
      this.logger.logError('An error occurred while trying to hash password', { context }, e);
    }

    try {
      await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Transaction started for token and user update', { context });

        existingToken.use();
        await this.updateUsedTokenAndSavePasswordChange(existingToken, hashedNewPassword, tx, context);

        this.logger.logInfo('Transaction completed successfully', { context });
      });
    } catch (e) {
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Successfully resetted the password', { context, tokenId, userId: this.provideUserId() });

    return ok(undefined);
  }

  private async handleExistingTokenVerification(tokenId: UUID, context: string): Promise<Result<PasswordResetToken, CustomError>> {
    let existingToken: PasswordResetToken | null;

    try {
      existingToken = await this.passwordTokenRepository.getById(tokenId);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch the token', { context }, e);
      return err(UnexpectedError.create());
    }

    if (!existingToken) {
      this.logger.logInfo('Reset token was not found', { context, tokenId });
      return err(PasswordTokenErrors.notFound());
    }

    if (existingToken.isUsed) {
      this.logger.logWarn('Reset token was already used', { context, tokenId });
      return err(PasswordTokenErrors.wasUsed());
    }

    return ok(existingToken);
  }

  private async updateUsedTokenAndSavePasswordChange(
    existingToken: PasswordResetToken,
    hashedPassword: string,
    tx: any,
    context: string,
  ): Promise<void> {
    const tokenUse = this.passwordTokenRepository.update(existingToken, tx);
    const passwordChange = this.userRepository.changePasswordById(this.provideUserId(), hashedPassword, tx);

    try {
      await Promise.all([tokenUse, passwordChange]);
    } catch (e) {
      this.logger.logError('An error occurred while trying to update reset token or saving password changes to user', { context }, e);
      throw e;
    }
  }

  // Helper method to register the userId after validation of token and retrieving it after that
  private provideUserId(): UUID;
  private provideUserId(userId: UUID): void;
  private provideUserId(userId?: UUID): UUID | void {
    if (userId) {
      this.userId = userId;
      return;
    }
    return this.userId;
  }
}
