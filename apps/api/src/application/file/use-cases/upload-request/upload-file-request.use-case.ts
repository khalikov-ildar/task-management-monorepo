import { CustomError } from '../../../../domain/common/error/custom-error';
import { Err, err, Ok, ok, Result } from 'neverthrow';
import { IUseCase } from '../../../common/i-use-case';
import { UploadFileRequestCommand } from './upload-file-request.command';
import { ILogger } from '@app/shared';
import { ContextualLogger } from '../../../common/services/contextual-logger';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { IFileLinkRepository } from '../../../../domain/repositories/file/i-file-link.repository';
import { FileLink } from '../../../../domain/entities/file/file-link';
import { UnexpectedError } from '../../../../domain/common/error/unexpected-error';
import { FileLinkErrors } from '../../../../domain/errors/file/file-link-errors';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';

export class UploadFileRequestUseCase implements IUseCase<UploadFileRequestCommand, void> {
  constructor(
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly fileLinkRepository: IFileLinkRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly _genericLogger: ILogger,
  ) {}

  private readonly logger = new ContextualLogger(UploadFileRequestUseCase.name, this._genericLogger);

  async execute(request: UploadFileRequestCommand): Promise<Result<void, CustomError>> {
    const userId = this.currentUserProvider.getCurrentUserDetails().userId;

    this.logger.logInfo('Attempt to upload file', { userId, link: request.fileLink });

    let transactionResult: Err<never, CustomError> | Ok<FileLink, never>;

    try {
      transactionResult = await this.transactionManager.execute(async (tx) => {
        const linkFetchingResult = await this.handleLinkFetching(request.fileLink, tx);
        if (linkFetchingResult.isErr()) {
          return err(linkFetchingResult.error);
        }

        const link = linkFetchingResult.value;

        if (link.isUsed) {
          return err(FileLinkErrors.alreadyUsed());
        }

        if (link.userId !== userId) {
          return err(FileLinkErrors.onlyLinkOwnerCanUseLink());
        }

        link.use();

        await this.handleLinkUpdate(link, tx);

        return ok(link);
      });
    } catch (e) {
      return err(UnexpectedError.create());
    }

    if (transactionResult.isErr()) {
      return err(transactionResult.error);
    }

    this.logger.logInfo('Upload file request permitted successfully', { fileLinkId: transactionResult.value.id });

    return ok(undefined);
  }

  private async handleLinkFetching(link: string, tx: any): Promise<Result<FileLink, CustomError>> {
    let fileLink: FileLink | null;
    try {
      fileLink = await this.fileLinkRepository.getByLink(link, tx);
    } catch (e) {
      this.logger.logError('An error occured while trying to fetch the file link', {}, e);
      throw e;
    }

    if (!fileLink) {
      return err(FileLinkErrors.notFound());
    }

    return ok(fileLink);
  }

  private async handleLinkUpdate(link: FileLink, tx: any): Promise<void> {
    try {
      await this.fileLinkRepository.update(link, tx);
    } catch (e) {
      this.logger.logError('An error occured while trying to save changes to link', { fileLinkId: link.id }, e);
      throw e;
    }
  }
}
