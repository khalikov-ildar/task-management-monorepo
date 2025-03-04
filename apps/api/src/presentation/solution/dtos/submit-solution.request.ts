import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { UUID } from 'node:crypto';

export class SubmitSolutionRequest {
  @IsUUID()
  fileId: UUID;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(400)
  additionalDetails?: string;
}
