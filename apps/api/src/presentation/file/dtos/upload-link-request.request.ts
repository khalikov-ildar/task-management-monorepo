import { IsInt, IsMimeType, IsString, Max, MinLength } from 'class-validator';

export class UploadLinkRequestRequest {
  private static MAX_FILE_SIZE_IN_BYTES = 5_242_880;

  @IsString()
  @MinLength(3)
  fileName: string;

  @IsMimeType()
  type: string;

  @IsInt()
  @Max(UploadLinkRequestRequest.MAX_FILE_SIZE_IN_BYTES)
  size: number;
}
