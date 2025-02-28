import { CustomError } from '../../../../domain/common/error/custom-error';
import { FileLink } from '../../../../domain/entities/file/file-link';
import { IFileLinkRepository } from '../../../../domain/repositories/file/i-file-link.repository';
import { IFileRepository } from '../../../../domain/repositories/file/i-file.repository';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../common/errors/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ILogger } from '../../../common/services/i-logger';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { FileUploadedEvent } from './file-uploaded.event';
import { FileDetails, IFileMetadataProvider } from '../../services/i-file-metadata.provider';
import { File } from '../../../../domain/entities/file/file';

export class FileUploadedEventHandler implements IUseCase<FileUploadedEvent, void> {
  constructor(
    private readonly fileMetadataProvider: IFileMetadataProvider,
    private readonly fileRepository: IFileRepository,
    private readonly fileLinkRepository: IFileLinkRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly logger: ILogger,
  ) {}

  async execute(request: FileUploadedEvent): Promise<Result<void, CustomError>> {
    const context = FileUploadedEventHandler.name;
    this.logger.logInfo('Attempt to proccess the fileUploadedEvent', { context });

    const details = this.fileMetadataProvider.extractDetailsFromMetadata(request.metadata);

    const fileLinkFetchResult = await this.handleFileLinkFetch(details, context);

    if (fileLinkFetchResult.isErr()) {
      return err(fileLinkFetchResult.error);
    }

    const link = fileLinkFetchResult.value;
    link.use();

    const file = new File(details.filename, request.etag, link.userId, link.id);

    try {
      await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Transaction for saving file and updating file link started', { context });
        await this.handleFileSaveAndFileLinkUpdate(file, link, tx, context);
        this.logger.logInfo('Transaction completed successfully', { context });
      });
    } catch (e) {
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Successfully handled the fileUploadedEvent', { context, fileId: file.id, fileLinkId: details.fileLinkId });

    return ok(undefined);
  }

  private async handleFileLinkFetch(details: FileDetails, context: string): Promise<Result<FileLink, CustomError>> {
    let fileLink: FileLink | void;
    try {
      fileLink = await this.fileLinkRepository.getById(details.fileLinkId);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch file link', { context, fileLinkId: details.fileLinkId }, e);
      return err(UnexpectedError.create());
    }

    if (!fileLink) {
      this.logger.logWarn('Filelink was not found', { context, fileLinkId: details.fileLinkId });
      return err(UnexpectedError.create());
    }
  }

  private async handleFileSaveAndFileLinkUpdate(file: File, link: FileLink, tx: any, context: string): Promise<void> {
    const saveFile = this.fileRepository.create(file, tx);
    const updateLink = this.fileLinkRepository.update(link, tx);

    try {
      await Promise.all([saveFile, updateLink]);
    } catch (e) {
      this.logger.logError('An error occurred while trying save file and update file link', { context }, e);
      throw e;
    }
  }
}
