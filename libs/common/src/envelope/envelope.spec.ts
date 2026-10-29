import { ok, created, page, fail, validationFailed } from './envelope.builder';
import { maskValue } from './mask';
import { EnvelopeContext, FieldIssue } from './envelope.types';
import { ErrorCode, FieldErrorCode } from '../errors';

const fixed = () => new Date('2026-10-24T10:00:00.000Z');
const ar: EnvelopeContext = { correlationId: 'c-1', language: 'ar', now: fixed };
const en: EnvelopeContext = { correlationId: 'c-1', language: 'en', now: fixed };

describe('success', () => {
  it('wraps data with meta', () => {
    const r = ok({ id: 1 }, en);
    expect(r.status).toBe(200);
    expect(r.body).toEqual({
      success: true, data: { id: 1 },
      meta: { correlationId: 'c-1', timestamp: '2026-10-24T10:00:00.000Z', language: 'en' },
    });
  });
  it('uses 201 for created', () => expect(created({}, en).status).toBe(201));
  it('has no 204: empty result is data null', () => expect(ok(null, en).body.data).toBeNull());
  it('computes totalPages', () => {
    const r = page([1, 2], { page: 1, pageSize: 20, total: 41 }, en);
    expect(r.body.meta.pagination).toEqual({ page: 1, pageSize: 20, total: 41, totalPages: 3 });
  });
  it('an empty list still has 1 page', () => {
    expect(page([], { page: 1, pageSize: 20, total: 0 }, en).body.meta.pagination!.totalPages).toBe(1);
  });
});

describe('errors', () => {
  it('Arabic message and status from the code', () => {
    const r = fail(ErrorCode.SEATS_UNAVAILABLE, ar);
    expect(r.status).toBe(409);
    expect(r.body.success).toBe(false);
    expect(r.body.error.code).toBe('SEATS_UNAVAILABLE');
    expect(r.body.error.message).toMatch(/[\u0600-\u06FF]/);
    expect(r.body.meta.language).toBe('ar');
  });
  it('same code, English', () => {
    expect(fail(ErrorCode.PAYMENT_DECLINED, en).body.error.message).toBe('Your payment was declined.');
  });
  it('puts the correlation id in the INTERNAL_ERROR hint', () => {
    const r = fail(ErrorCode.INTERNAL_ERROR, { ...en, correlationId: 'abc-123' });
    expect(r.status).toBe(500);
    expect(r.body.error.hint).toContain('abc-123');
  });
  it('turns an unknown code into INTERNAL_ERROR and leaks nothing', () => {
    const r = fail('relation "users" does not exist', en);
    expect(r.status).toBe(500);
    expect(JSON.stringify(r.body)).not.toContain('does not exist');
  });
  it('fills params', () => {
    expect(fail(ErrorCode.RATE_LIMITED, en, { seconds: 20 }).body.error.hint).toBe('Wait 20 seconds and try again.');
  });
});

describe('validation', () => {
  const issues: FieldIssue[] = [
    { field: 'email', code: FieldErrorCode.FIELD_INVALID_FORMAT, value: 'mona@', params: { example: 'name@example.com' } },
    { field: 'password', code: FieldErrorCode.FIELD_TOO_SHORT, value: 'abc', params: { min: 8 } },
    { field: 'nationalId', code: FieldErrorCode.FIELD_INVALID_FORMAT, value: '29901011234567', params: { example: '14 digits' } },
  ];
  it('names field, value and next step (BR-57)', () => {
    const r = validationFailed(issues, en);
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe('VALIDATION_FAILED');
    const [email] = r.body.error.details!;
    expect(email.field).toBe('email');
    expect(email.value).toBe('m***');
    expect(email.message).toBe('Email is not in the right format.');
    expect(email.hint).toContain('name@example.com');
  });
  it('never echoes a password', () => {
    const d = validationFailed(issues, en).body.error.details!;
    expect(d[1]).not.toHaveProperty('value');
    expect(JSON.stringify(d)).not.toContain('abc');
  });
  it('masks the National ID', () => {
    expect(validationFailed(issues, en).body.error.details![2].value).toBe('**********4567');
  });
  it('writes details in Arabic when asked', () => {
    expect(validationFailed(issues, ar).body.error.details![1].message).toBe('يجب ألا يقل كلمة المرور عن 8 أحرف.');
  });
});

describe('maskValue', () => {
  it.each([
    ['password', 'x', undefined], ['code', '1234', undefined], ['cardNumber', '4242', undefined],
    ['passengers[0].nationalId', '29901011234567', '**********4567'],
    ['phone', '01012345678', '*******5678'],
    ['fullName', 'Mona Hassan', 'Mona Hassan'],
  ])('%s', (f, v, out) => expect(maskValue(f, v)).toBe(out));
  it('shortens very long values', () => expect(maskValue('note', 'a'.repeat(200))!.length).toBe(61));
});
