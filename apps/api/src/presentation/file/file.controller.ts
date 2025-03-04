import { Body, Controller, Post, Put, Req, UseInterceptors } from '@nestjs/common';
import { UploadLinkRequestUseCase } from '../../application/file/use-cases/link-request/upload-link-request.use-case';
import { UploadFileRequestUseCase } from '../../application/file/use-cases/upload-request/upload-file-request.use-case';
import { ResultMapperInterceptor } from '../../infrastructure/common/inteceptors/result.mapper.interceptor';
import { UploadLinkRequestCommand } from '../../application/file/use-cases/link-request/upload-link-request.command';
import { UploadLinkRequestRequest } from './dtos/upload-link-request.request';
import { UploadFileRequestCommand } from '../../application/file/use-cases/upload-request/upload-file-request.command';

@UseInterceptors(ResultMapperInterceptor)
@Controller('files')
export class FileController {
  constructor(
    private readonly requestLink: UploadLinkRequestUseCase,
    private readonly uploadFile: UploadFileRequestUseCase,
  ) {}

  @Post()
  async requestUploadLink(@Body() request: UploadLinkRequestRequest) {
    return await this.requestLink.execute(new UploadLinkRequestCommand(request.fileName, request.type, request.size));
  }

  @Put()
  async requestUploadFile(@Req() request: Request) {
    const url = request.headers['x-original-url'];

    return await this.uploadFile.execute(new UploadFileRequestCommand(url));
  }
}
