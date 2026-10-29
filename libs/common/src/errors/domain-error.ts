import { ErrorCode } from './error-codes';

export type ErrorParams = Record<string, string | number>;

export class DomainError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly params: ErrorParams = {},
  ) {
    super(code);
    this.name = 'DomainError';
  }
}
