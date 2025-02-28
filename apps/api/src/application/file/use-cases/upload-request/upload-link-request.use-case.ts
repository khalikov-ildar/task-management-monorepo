import { CustomError } from '../../../../domain/common/error/custom-error';
import { FileLink } from '../../../../domain/entities/file/file-link';
import { IFileLinkRepository } from '../../../../domain/repositories/file/i-file-link.repository';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../common/errors/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { ILogger } from '../../../common/services/i-logger';
import { UploadLinkRequestCommand } from './upload-link-request.command';
import { UploadLinkRequestSuccessResponse } from '../../dtos/upload-link-request-success.response';
import { IFileStorageRepository } from '../../../../domain/repositories/file/i-file-storage.repository';
import { IUuidProvider } from '../../../common/services/i-uuid.provider';

export class UploadLinkRequestUseCase implements IUseCase<UploadLinkRequestCommand, UploadLinkRequestSuccessResponse> {
  constructor(
    private readonly fileStorage: IFileStorageRepository,
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly fileLinkRepository: IFileLinkRepository,
    private readonly uuidProvider: IUuidProvider,
    private readonly logger: ILogger,
  ) {}

  async execute(request: UploadLinkRequestCommand): Promise<Result<UploadLinkRequestSuccessResponse, CustomError>> {
    const context = UploadLinkRequestUseCase.name;
    const userId = this.currentUserProvider.getCurrentUserDetails().userId;
    this.logger.logInfo('Attempt to create upload request link', { context, userId });

    const fileLinkId = this.uuidProvider.generate();

    let link: string;
    try {
      link = await this.fileStorage.requestUploadLink(fileLinkId, request.fileName, request.type, request.size);
    } catch (e) {
      this.logger.logError('An error occurred while trying to create upload link', { context }, e);
      return err(UnexpectedError.create());
    }

    const fileLink = new FileLink(fileLinkId, userId, link);

    try {
      await this.fileLinkRepository.save(fileLink);
    } catch (e) {
      this.logger.logError('An error occurred while trying to save upload link', { context }, e);
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Successfully created upload request link', { context, userId, link });

    return ok(new UploadLinkRequestSuccessResponse(link));
  }
}
