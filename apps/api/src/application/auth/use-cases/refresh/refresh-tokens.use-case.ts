import { CustomError } from '../../../../domain/common/error/custom-error';
import { RefreshToken } from '../../../../domain/entities/tokens/refresh-token';
import { Role } from '../../../../domain/entities/user/role/role';
import { IRefreshTokenRepository } from '../../../../domain/repositories/tokens/i-refresh-token.repository';
import { UUID } from 'node:crypto';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../common/errors/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ILogger } from '../../../common/services/i-logger';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { TokenPair } from '../../dtos/token-pair';
import { IAuthenticationTokenProvider } from '../../services/i-auth-token.provider';
import { RefreshTokensCommand } from './refresh-tokens.command';
import { RefreshTokenErrors } from '../../../../domain/errors/tokens/refresh-token.errors';

export class RefreshTokensUseCase implements IUseCase<RefreshTokensCommand, TokenPair> {
  constructor(
    private readonly tokenRepository: IRefreshTokenRepository,
    private readonly tokenProvider: IAuthenticationTokenProvider,
    private readonly transactionManager: ITransactionManager,
    private readonly logger: ILogger,
  ) {}

  async execute(request: RefreshTokensCommand): Promise<Result<TokenPair, CustomError>> {
    const context = RefreshTokensUseCase.name;
    const userId = request.userId;

    this.logger.logInfo('Attempt to refresh tokens', { context, userId });

    const getExistingTokenResult = await this.getExistingToken(request, context, userId);

    if (getExistingTokenResult.isErr()) {
      return err(getExistingTokenResult.error);
    }
    const existingToken = getExistingTokenResult.value;
    let result: Result<TokenPair, CustomError>;

    try {
      result = await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Transaction for handling revoking and saving new tokens started', { context });

        // Check if the token revoked -> if revoked: revoke all active tokens
        const result = await this.handleTokenReuseCheck(existingToken, tx, context, userId);

        if (result.isErr()) {
          return err(result.error);
        }

        // Create new refresh token pair -> revoke the provided one -> save new refresh token and update provided one

        const newPair = await this.generateNewTokens(userId, request.role, context);

        const refreshToken = new RefreshToken(request.userId, newPair.refreshToken);

        existingToken.revoke();

        await this.saveAndUpdateTokens(refreshToken, existingToken, tx, context);

        this.logger.logInfo('Transaction successfully completed', { context });
        return ok(newPair);
      });
      if (result.isErr()) {
        return err(result.error);
      }

      this.logger.logInfo('Successfully refreshed tokens', { context, userId });

      return ok(result.value);
    } catch (e) {
      return err(UnexpectedError.create());
    }
  }

  private async getExistingToken(request: RefreshTokensCommand, context: string, userId: UUID): Promise<Result<RefreshToken, CustomError>> {
    let existingToken: RefreshToken | null;
    try {
      existingToken = await this.tokenRepository.getByToken(request.token);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch the refresh token', { context, userId });
      return err(UnexpectedError.create());
    }

    if (!existingToken) {
      this.logger.logInfo('Refresh token was not found', { context, userId });
      return err(RefreshTokenErrors.NoTokenFound());
    }

    return ok(existingToken);
  }

  private async handleTokenReuseCheck(token: RefreshToken, tx: any, context: string, userId: UUID): Promise<Result<void, CustomError>> {
    if (token.isRevoked) {
      try {
        await this.revokeAllActiveTokensForUser(token, tx);
      } catch (e) {
        this.logger.logError('An error occurred while trying to revoke active tokens for user', { context, userId }, e);
        throw e;
      }

      this.logger.logWarn('Token reuse detected', { context, userId, tokenId: token.id });
      return err(RefreshTokenErrors.TokenReuseDetected());
    }
    return ok(undefined);
  }

  private async revokeAllActiveTokensForUser(token: RefreshToken, tx: any) {
    const tokens = await this.tokenRepository.getAllActiveTokensByUserId(token.userId, tx);

    for (const activeToken of tokens) {
      activeToken.revoke();
    }

    await this.tokenRepository.updateMultipleTokens(tokens, tx);
  }

  async generateNewTokens(userId: UUID, role: Role, context: string): Promise<TokenPair> {
    try {
      const newPair = await this.tokenProvider.signTokenPair(userId, role);
      return newPair;
    } catch (e) {
      this.logger.logError('An error occurred when trying to sign new token pair', { context, userId }, e);
      throw e;
    }
  }

  async saveAndUpdateTokens(newToken: RefreshToken, oldToken: RefreshToken, tx: any, context: string): Promise<void> {
    const create = this.tokenRepository.save(newToken, tx);
    const update = this.tokenRepository.updateToken(oldToken, tx);

    try {
      await Promise.all([create, update]);
    } catch (e) {
      this.logger.logError('An error occurred while trying to save new token and update old one', { context }, e);
      throw e;
    }
  }
}
