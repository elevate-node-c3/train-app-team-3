import { ErrorCode, ErrorParams, FieldErrorCode, resolveError, resolveFieldError } from '../errors';
import {
  EnvelopeContext, ErrorEnvelope, FieldDetail, FieldIssue, Meta, Pagination, SuccessEnvelope,
} from './envelope.types';
import { maskValue } from './mask';

function meta(ctx: EnvelopeContext, pagination?: Pagination): Meta {
  return {
    correlationId: ctx.correlationId,
    timestamp: (ctx.now ? ctx.now() : new Date()).toISOString(),
    language: ctx.language,
    ...(pagination ? { pagination } : {}),
  };
}

/** 200 with data. Nothing to return? Use ok(null): there is no 204, so the envelope is always present. */
export function ok<T>(data: T, ctx: EnvelopeContext): { status: 200; body: SuccessEnvelope<T> } {
  return { status: 200, body: { success: true, data, meta: meta(ctx) } };
}

/** 201 for a created resource. */
export function created<T>(data: T, ctx: EnvelopeContext): { status: 201; body: SuccessEnvelope<T> } {
  return { status: 201, body: { success: true, data, meta: meta(ctx) } };
}

/** A page of items. totalPages is calculated here so every endpoint agrees. */
export function page<T>(items: T[], p: { page: number; pageSize: number; total: number }, ctx: EnvelopeContext) {
  const pagination: Pagination = { ...p, totalPages: Math.max(Math.ceil(p.total / p.pageSize), 1) };
  return { status: 200 as const, body: { success: true as const, data: items, meta: meta(ctx, pagination) } };
}

/** Any business or system error, by code. Unknown codes become INTERNAL_ERROR (nothing internal leaks). */
export function fail(
  code: string,
  ctx: EnvelopeContext,
  params: ErrorParams = {},
  details?: FieldDetail[],
): { status: number; body: ErrorEnvelope } {
  const known = resolveError(code, ctx.language, { correlationId: ctx.correlationId, ...params });
  return {
    status: known.httpStatus,
    body: {
      success: false,
      error: {
        code: known.code,
        message: known.message,
        hint: known.hint,
        ...(details && details.length ? { details } : {}),
      },
      meta: meta(ctx),
    },
  };
}

/** 400 VALIDATION_FAILED with one detail per wrong field. Secret values are never echoed. */
export function validationFailed(issues: FieldIssue[], ctx: EnvelopeContext) {
  const details = issues.map((i) =>
    resolveFieldError(i.code as FieldErrorCode, ctx.language, i.field, maskValue(i.field, i.value), i.params),
  );
  return fail(ErrorCode.VALIDATION_FAILED, ctx, {}, details);
}
