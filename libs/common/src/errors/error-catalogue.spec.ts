import { ErrorCode, FieldErrorCode } from './error-codes';
import { errorCatalogue, resolveError, resolveFieldError, DEFAULT_LANGUAGE } from './error-resolver';
import { DomainError } from './domain-error';

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
const ARABIC = /[\u0600-\u06FF]/;
const entries = Object.entries(errorCatalogue.errors);

describe('error catalogue', () => {
  it('has exactly the codes declared in ErrorCode', () => {
    expect(Object.keys(errorCatalogue.errors).sort()).toEqual(Object.values(ErrorCode).sort());
    expect(Object.keys(errorCatalogue.fieldErrors).sort()).toEqual(Object.values(FieldErrorCode).sort());
  });

  it.each(entries)('%s has Arabic and English message and hint', (_code, e) => {
    for (const t of [e.message, e.hint]) {
      expect(t.en.trim()).not.toBe('');
      expect(t.ar.trim()).not.toBe('');
      expect(ARABIC.test(t.ar)).toBe(true);
    }
  });

  it.each(entries)('%s uses the same placeholders in both languages', (_code, e) => {
    expect(placeholders(e.message.ar)).toBe(placeholders(e.message.en));
    expect(placeholders(e.hint.ar)).toBe(placeholders(e.hint.en));
  });

  it.each(entries)('%s has an HTTP status between 400 and 599', (_code, e) => {
    expect(e.httpStatus).toBeGreaterThanOrEqual(400);
    expect(e.httpStatus).toBeLessThan(600);
  });

  it('never uses a vague message (BR-57)', () => {
    for (const [, e] of entries) expect(e.message.en.toLowerCase()).not.toContain('something went wrong');
  });

  it('every field label exists in both languages', () => {
    for (const l of Object.values(errorCatalogue.fieldLabels)) {
      expect(l.ar).toBeTruthy();
      expect(l.en).toBeTruthy();
    }
  });
});

describe('resolveError', () => {
  it('fills placeholders', () => {
    expect(resolveError(ErrorCode.RATE_LIMITED, 'en', { seconds: 30 }).hint).toBe('Wait 30 seconds and try again.');
  });
  it('turns an unknown code into INTERNAL_ERROR', () => {
    expect(resolveError('SQL_SYNTAX_ERROR', 'en').code).toBe(ErrorCode.INTERNAL_ERROR);
  });
  it('defaults to Arabic', () => {
    expect(DEFAULT_LANGUAGE).toBe('ar');
  });
  it('builds a field error with label, value and next step', () => {
    const r = resolveFieldError(FieldErrorCode.FIELD_TOO_SHORT, 'en', 'password', undefined, { min: 8 });
    expect(r.message).toBe('Password must be at least 8 characters.');
    expect(r).not.toHaveProperty('value');
  });
});

describe('field labels', () => {
  it('uses the label of the last part of a nested path', () => {
    const r = resolveFieldError(FieldErrorCode.FIELD_REQUIRED, 'en', 'passengers[0].fullName', undefined);
    expect(r.message).toBe('Full name is required.');
  });
});

describe('DomainError', () => {
  it('carries the code and no readable text', () => {
    const e = new DomainError(ErrorCode.SEATS_UNAVAILABLE, { tripId: 'x' });
    expect(e.message).toBe('SEATS_UNAVAILABLE');
    expect(e.params).toEqual({ tripId: 'x' });
  });
});
