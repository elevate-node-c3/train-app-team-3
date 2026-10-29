import { FieldErrorCode } from '../errors';
import { FieldIssue } from '../envelope';


export interface ValidationErrorLike {
  property: string;
  value?: unknown;
  constraints?: Record<string, string>;
  contexts?: Record<string, Record<string, string | number>>;
  children?: ValidationErrorLike[];
}

const F = FieldErrorCode;


const CONSTRAINT_TO_CODE: Record<string, FieldErrorCode> = {
  isNotEmpty: F.FIELD_REQUIRED,
  isDefined: F.FIELD_REQUIRED,
  minLength: F.FIELD_TOO_SHORT,
  maxLength: F.FIELD_TOO_LONG,
  min: F.FIELD_OUT_OF_RANGE,
  max: F.FIELD_OUT_OF_RANGE,
  arrayMinSize: F.FIELD_OUT_OF_RANGE,
  arrayMaxSize: F.FIELD_OUT_OF_RANGE,
  isIn: F.FIELD_INVALID_CHOICE,
  isEnum: F.FIELD_INVALID_CHOICE,
  whitelistValidation: F.FIELD_NOT_ALLOWED,
};

const codeFor = (constraint: string): FieldErrorCode => CONSTRAINT_TO_CODE[constraint] ?? F.FIELD_INVALID_FORMAT;

const joinPath = (parent: string, prop: string) =>
  /^\d+$/.test(prop) ? `${parent}[${prop}]` : parent ? `${parent}.${prop}` : prop;

export function fromClassValidator(errors: ValidationErrorLike[], parent = ''): FieldIssue[] {
  const issues: FieldIssue[] = [];
  for (const e of errors) {
    const path = joinPath(parent, e.property);
    const keys = Object.keys(e.constraints ?? {});
    if (keys.length) {
      const missing = e.value === undefined || e.value === null || e.value === '';
      const key = missing && keys.includes('isNotEmpty') ? 'isNotEmpty' : keys[0];
      issues.push({
        field: path,
        code: e.value === undefined || e.value === null ? F.FIELD_REQUIRED : codeFor(key),
        value: e.value,
        params: e.contexts?.[key],
      });
    }
    if (e.children?.length) issues.push(...fromClassValidator(e.children, path));
  }
  return issues;
}
