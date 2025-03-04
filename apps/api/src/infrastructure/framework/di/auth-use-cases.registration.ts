import { Provider } from '@nestjs/common';
import { IAuthenticationTokenProvider } from '../../../application/auth/services/i-auth-token.provider';
import { IPasswordTokenProvider } from '../../../application/auth/services/i-password-token.provider';
import { IPasswordHasher } from '../../../application/auth/services/i-password.hasher';
import { LoginUserUseCase } from '../../../application/auth/use-cases/login/login-user.use-case';
import { LogoutUserUseCase } from '../../../application/auth/use-cases/logout/logout-user.use-case';
import { PasswordResetRequestUseCase } from '../../../application/auth/use-cases/password-reset-request/password-reset-request.use-case';
import { PasswordResetUseCase } from '../../../application/auth/use-cases/password-reset/password-reset.use-case';
import { RefreshTokensUseCase } from '../../../application/auth/use-cases/refresh/refresh-tokens.use-case';
import { RegisterUserUseCase } from '../../../application/auth/use-cases/register/register-user.use-case';
import { ICurrentUserProvider } from '../../../application/common/services/i-current-user.provider';
import { ILogger } from '@app/shared';
import { ITransactionManager } from '../../../application/common/services/i-transaction.manager';
import { IPasswordTokenRepository } from '../../../domain/repositories/tokens/i-password-token.repository';
import { IRefreshTokenRepository } from '../../../domain/repositories/tokens/i-refresh-token.repository';
import { IRoleRepository } from '../../../domain/repositories/user/i-role.repository';
import { IUserRepository } from '../../../domain/repositories/user/i-user.repository';
import { IEventPublisher } from '../../../application/common/services/i-event-publisher';
import { IEmailTokenProvider } from '../../../application/auth/services/i-email-token.provider';
import { IEmailTokenRepository } from '../../../domain/repositories/tokens/i-email-token.repository';
import { ConfirmEmailUseCase } from '../../../application/auth/use-cases/confirm-email/confirm-email.use-case';
import { SendEmailConfirmationUseCase } from '../../../application/auth/use-cases/send-email-confirmation/send-email-confirmation.use-case';

export function registerAuthUseCases(): Provider[] {
  return [
    {
      provide: RegisterUserUseCase,
      useFactory: (
        userRepo: IUserRepository,
        passwordHasher: IPasswordHasher,
        roleRepo: IRoleRepository,
        emailTokenProvider: IEmailTokenProvider,
        emailTokenRepo: IEmailTokenRepository,
        eventPublisher: IEventPublisher,
        transManager: ITransactionManager,
        logger: ILogger,
      ) =>
        new RegisterUserUseCase(
          userRepo,
          passwordHasher,
          roleRepo,
          emailTokenProvider,
          emailTokenRepo,
          eventPublisher,
          transManager,
          logger,
        ),
      inject: [IUserRepository, IPasswordHasher, IRoleRepository, ILogger],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (
        userRepo: IUserRepository,
        passwordHasher: IPasswordHasher,
        transManager: ITransactionManager,
        tokenProvider: IAuthenticationTokenProvider,
        tokenRepo: IRefreshTokenRepository,
        logger: ILogger,
      ) => new LoginUserUseCase(userRepo, passwordHasher, transManager, tokenProvider, tokenRepo, logger),
      inject: [IUserRepository, IPasswordHasher, ITransactionManager, IAuthenticationTokenProvider, IRefreshTokenRepository, ILogger],
    },
    {
      provide: LogoutUserUseCase,
      useFactory: (tokenRepo: IRefreshTokenRepository, currentUserProvider: ICurrentUserProvider, logger: ILogger) =>
        new LogoutUserUseCase(tokenRepo, currentUserProvider, logger),
      inject: [IRefreshTokenRepository, ICurrentUserProvider, ILogger],
    },
    {
      provide: RefreshTokensUseCase,
      useFactory: (
        tokenRepo: IRefreshTokenRepository,
        tokenProvider: IAuthenticationTokenProvider,
        transManager: ITransactionManager,
        logger: ILogger,
      ) => new RefreshTokensUseCase(tokenRepo, tokenProvider, transManager, logger),
      inject: [IRefreshTokenRepository, IAuthenticationTokenProvider, ITransactionManager, ILogger],
    },
    {
      provide: PasswordResetRequestUseCase,
      useFactory: (
        userRepo: IUserRepository,
        passwordTokenProvider: IPasswordTokenProvider,
        transManager: ITransactionManager,
        passwordTokenRepo: IPasswordTokenRepository,
        eventPublisher: IEventPublisher,
        logger: ILogger,
      ) => new PasswordResetRequestUseCase(userRepo, passwordTokenProvider, transManager, passwordTokenRepo, eventPublisher, logger),
      inject: [IUserRepository, IPasswordTokenProvider, ITransactionManager, IPasswordTokenRepository, IEventPublisher, ILogger],
    },
    {
      provide: PasswordResetUseCase,
      useFactory: (
        passwordTokenRepo: IPasswordTokenRepository,
        passwordTokenProvider: IPasswordTokenProvider,
        passwordHasher: IPasswordHasher,
        userRepo: IUserRepository,
        transManager: ITransactionManager,
        logger: ILogger,
      ) => new PasswordResetUseCase(passwordTokenRepo, passwordTokenProvider, passwordHasher, userRepo, transManager, logger),
      inject: [IPasswordTokenRepository, IPasswordTokenProvider, IPasswordHasher, IUserRepository, ITransactionManager, ILogger],
    },
    {
      provide: ConfirmEmailUseCase,
      useFactory: (
        emailTokenRepo: IEmailTokenRepository,
        emailTokenProvider: IEmailTokenProvider,
        userRepo: IUserRepository,
        transManager: ITransactionManager,
        logger: ILogger,
      ) => new ConfirmEmailUseCase(emailTokenRepo, emailTokenProvider, userRepo, transManager, logger),
      inject: [IEmailTokenRepository, IEmailTokenProvider, IUserRepository, ITransactionManager, ILogger],
    },
    {
      provide: SendEmailConfirmationUseCase,
      useFactory: (
        userRepo: IUserRepository,
        emailTokenProvider: IEmailTokenProvider,
        emailTokenRepo: IEmailTokenRepository,
        eventPublisher: IEventPublisher,
        transManager: ITransactionManager,
        logger: ILogger,
      ) => new SendEmailConfirmationUseCase(userRepo, emailTokenProvider, emailTokenRepo, eventPublisher, transManager, logger),
    },
  ];
}
