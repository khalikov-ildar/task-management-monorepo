import { Result } from 'neverthrow';
import { CustomError } from '../../domain/common/error/custom-error';

export interface IUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<Result<TResponse, CustomError>>;
}
