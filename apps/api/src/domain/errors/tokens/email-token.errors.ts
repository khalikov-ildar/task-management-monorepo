import { CustomError } from '../../common/error/custom-error';

export class EmailTokensErrors {
  public static tokenExpiredOrWasNotFound(): CustomError {
    return new CustomError('Validation', 'The provided token is expired or it was not found');
  }
}
