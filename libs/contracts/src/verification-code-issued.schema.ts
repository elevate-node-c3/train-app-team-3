import {
  VerificationCodeIssuedEvent,
  VerificationPurpose,
} from './verification-code-issued.event';

export const VERIFICATION_CODE_ISSUED_TYPE = 'verification-code-issued' as const;
export const SUPPORTED_VERSIONS: readonly number[] = [1];

export function buildVerificationCodeIssuedEvent(input: {
  eventId: string;
  correlationId: string;
  occurredAt: Date;
  email: string;
  code: string;
  language: string;
  purpose: VerificationPurpose;
  expiresAt: Date;
}): VerificationCodeIssuedEvent {
  return {
    eventId: input.eventId,
    type: VERIFICATION_CODE_ISSUED_TYPE,
    version: 1,
    occurredAt: input.occurredAt.toISOString(),
    correlationId: input.correlationId,
    producer: 'identity',
    payload: {
      email: input.email,
      code: input.code,
      language: input.language,
      purpose: input.purpose,
      expiresAt: input.expiresAt.toISOString(),
    },
  };
}

export type ParseResult =
  | { ok: true; event: VerificationCodeIssuedEvent }
  | { ok: false; reason: string };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0;

const isDateString = (v: unknown): v is string =>
  typeof v === 'string' && !Number.isNaN(new Date(v).getTime());

export function parseVerificationCodeIssued(raw: unknown): ParseResult {
  const fail = (reason: string): ParseResult => ({ ok: false, reason });

  if (!isRecord(raw)) return fail('message is not an object');
  if (raw.type !== VERIFICATION_CODE_ISSUED_TYPE) return fail('unknown event type');
  if (typeof raw.version !== 'number' || !SUPPORTED_VERSIONS.includes(raw.version)) {
    return fail('unsupported version');
  }

  for (const field of ['eventId', 'correlationId', 'producer'] as const) {
    if (!isNonEmptyString(raw[field])) return fail(`missing or invalid field: ${field}`);
  }
  if (!isDateString(raw.occurredAt)) return fail('missing or invalid field: occurredAt');

  const payload = raw.payload;
  if (!isRecord(payload)) return fail('missing field: payload');
  if (!isNonEmptyString(payload.email)) return fail('missing or invalid field: payload.email');
  if (typeof payload.code !== 'string' || !/^\d{6}$/.test(payload.code)) {
    return fail('missing or invalid field: payload.code');
  }
  if (!isNonEmptyString(payload.language)) return fail('missing or invalid field: payload.language');
  if (!isNonEmptyString(payload.purpose)) return fail('missing or invalid field: payload.purpose');
  if (!isDateString(payload.expiresAt)) return fail('missing or invalid field: payload.expiresAt');

  return { ok: true, event: raw as unknown as VerificationCodeIssuedEvent };
}