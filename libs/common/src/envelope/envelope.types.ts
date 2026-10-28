import { Language } from '../errors';

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Meta {
  correlationId: string;
  timestamp: string;
  language: Language;
  pagination?: Pagination;
}

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta: Meta;
}

export interface FieldDetail {
  code: string;
  field: string;
  value?: string;
  message: string;
  hint: string;
}

export interface ErrorBody {
  code: string;
  message: string;
  hint: string;
  details?: FieldDetail[];
}

export interface ErrorEnvelope {
  success: false;
  error: ErrorBody;
  meta: Meta;
}

export type ApiEnvelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

export interface EnvelopeContext {
  correlationId: string;
  language: Language;
  now?: () => Date;
}

export interface FieldIssue {
  field: string;
  code: string;
  value?: unknown;
  params?: Record<string, string | number>;
}
