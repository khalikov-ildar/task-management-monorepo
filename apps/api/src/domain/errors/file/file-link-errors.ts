import { CustomError } from '../../common/error/custom-error';

export class FileLinkErrors {
  public static notFound(): CustomError {
    return new CustomError('NotFound', 'The file link was not found');
  }

  public static alreadyUsed(): CustomError {
    return new CustomError('Validation', 'The file link was already used');
  }

  public static onlyLinkOwnerCanUseLink(): CustomError {
    return new CustomError('Forbidden', 'The file link can be used only by its owner');
  }
}
