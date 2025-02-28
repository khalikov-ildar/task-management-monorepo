export class CustomError extends Error {
  constructor(
    public readonly code: keyof typeof ErrorTypes,
    public readonly message: string,
  ) {
    super(message);
  }
}

export const ErrorTypes = {
  Validation: 'Validation',
  Unauthorized: 'Unauthorized',
  Forbidden: 'Forbidden',
  NotFound: 'NotFound',
  Conflict: 'Conflict',
  Internal: 'Internal',
} as const;
