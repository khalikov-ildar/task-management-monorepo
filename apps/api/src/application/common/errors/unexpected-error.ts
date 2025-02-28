import { CustomError } from '../../../domain/common/error/custom-error';

export class UnexpectedError {
  public static create(): CustomError {
    return new CustomError('Internal', 'Something unexpected happened while processing your request. Please try again.');
  }
}
