import { CustomError } from '../../../../domain/common/error/custom-error';
import { FileLink } from '../../../../domain/entities/file/file-link';
import { IFileLinkRepository } from '../../../../domain/repositories/file/i-file-link.repository';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../../domain/common/error/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { ILogger } from '@app/shared';
import { UploadLinkRequestCommand } from './upload-link-request.command';
import { UploadLinkRequestSuccessResponse } from '../../dtos/upload-link-request-success.response';
import { IFileStorageRepository } from '../../../../domain/repositories/file/i-file-storage.repository';
import { IUuidProvider } from '../../../common/services/i-uuid.provider';
import { ContextualLogger } from '../../../common/services/contextual-logger';

export class UploadLinkRequestUseCase implements IUseCase<UploadLinkRequestCommand, UploadLinkRequestSuccessResponse> {
  constructor(
    private readonly fileStorage: IFileStorageRepository,
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly fileLinkRepository: IFileLinkRepository,
    private readonly uuidProvider: IUuidProvider,
    private readonly _genericLogger: ILogger,
  ) {}
  private readonly logger = new ContextualLogger(UploadLinkRequestUseCase.name, this._genericLogger);

  async execute(request: UploadLinkRequestCommand): Promise<Result<UploadLinkRequestSuccessResponse, CustomError>> {
    const userId = this.currentUserProvider.getCurrentUserDetails().userId;
    this.logger.logInfo('Attempt to create upload request link', { userId });

    const fileLinkId = this.uuidProvider.generate();

    let link: string;
    try {
      link = await this.fileStorage.requestUploadLink(fileLinkId, request.fileName, request.type, request.size);
    } catch (e) {
      this.logger.logError('An error occurred while trying to create upload link', {}, e);
      return err(UnexpectedError.create());
    }

    const fileLink = new FileLink(fileLinkId, userId, link);

    try {
      await this.fileLinkRepository.save(fileLink);
    } catch (e) {
      this.logger.logError('An error occurred while trying to save upload link', {}, e);
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Successfully created upload request link', { userId, link });

    return ok(new UploadLinkRequestSuccessResponse(link));
  }
}
