import { CustomError } from '../../common/error/custom-error';

export class PasswordTokenErrors {
  private static readonly passwordTokenValidationError = new CustomError('Validation', 'This password reset link is no longer valid');

  public static notFound(): CustomError {
    return PasswordTokenErrors.passwordTokenValidationError;
  }

  public static wasUsed(): CustomError {
    return PasswordTokenErrors.passwordTokenValidationError;
  }

  public static expired(): CustomError {
    return PasswordTokenErrors.passwordTokenValidationError;
  }
}
