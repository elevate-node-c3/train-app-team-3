import catalogue from './error-catalogue.json';
import { ErrorCode, FieldErrorCode } from './error-codes';
import { ErrorParams } from './domain-error';

export type Language = 'ar' | 'en';
export const DEFAULT_LANGUAGE: Language = 'ar';
export const SUPPORTED_LANGUAGES: Language[] = ['ar', 'en'];

type Text = Record<Language, string>;
interface ErrorEntry { httpStatus: number; group: string; message: Text; hint: Text }
interface FieldEntry { message: Text; hint: Text }

const errors = catalogue.errors as unknown as Record<string, ErrorEntry>;
const fieldErrors = catalogue.fieldErrors as unknown as Record<string, FieldEntry>;
const fieldLabels = catalogue.fieldLabels as unknown as Record<string, Text>;

export function interpolate(template: string, params: ErrorParams = {}): string {
  return template.replace(/\{(\w+)\}/g, (whole, key) => (key in params ? String(params[key]) : whole));
}

const pick = (t: Text, lang: Language): string => t[lang] ?? t[DEFAULT_LANGUAGE];

export interface ResolvedError {
  code: string;
  httpStatus: number;
  message: string;
  hint: string;
}

export function resolveError(code: string, lang: Language, params: ErrorParams = {}): ResolvedError {
  const known = code in errors;
  const entry = known ? errors[code] : errors[ErrorCode.INTERNAL_ERROR];
  return {
    code: known ? code : ErrorCode.INTERNAL_ERROR,
    httpStatus: entry.httpStatus,
    message: interpolate(pick(entry.message, lang), params),
    hint: interpolate(pick(entry.hint, lang), params),
  };
}

export interface ResolvedFieldError {
  code: string;
  field: string;
  value?: string;
  message: string;
  hint: string;
}

export function resolveFieldError(
  code: FieldErrorCode,
  lang: Language,
  field: string,
  value: string | undefined,
  params: ErrorParams = {},
): ResolvedFieldError {
  const entry = fieldErrors[code];
  const leaf = field.split('.').pop()!.replace(/\[\d+\]$/, '');
  const labelEntry = fieldLabels[field] ?? fieldLabels[leaf];
  const label = labelEntry ? pick(labelEntry, lang) : field;
  const all = { label, ...params };
  return {
    code,
    field,
    ...(value !== undefined ? { value } : {}),
    message: interpolate(pick(entry.message, lang), all),
    hint: interpolate(pick(entry.hint, lang), all),
  };
}

export const errorCatalogue = { errors, fieldErrors, fieldLabels };
