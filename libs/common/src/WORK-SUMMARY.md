# Work Summary


## 1. Code: `libs/common`

Everything below is in `libs-common.zip`. It is TypeScript, type-checks, and has **183 passing tests**.

```
libs/common/src/
├── errors/      error codes and messages (Arabic + English)
├── envelope/    the shape of every API response
├── i18n/        choosing the language
└── index.ts     exports everything
```

### 3.1 `errors/`

One place for all errors a client can see.

| File | Purpose |
|---|---|
| `error-catalogue.json` | 43 errors. Each has an HTTP status, an Arabic and English message, and an Arabic and English "what to do next". Also 7 field-level codes (`FIELD_REQUIRED`, ...) and field names in both languages. |
| `error-codes.ts` | The codes as constants, e.g. `ErrorCode.SEATS_UNAVAILABLE`. |
| `domain-error.ts` | `DomainError`: the only error a service throws on purpose. It carries a code and params, never readable text. |
| `error-catalogue.ts` | `resolveError()` and `resolveFieldError()`: turn a code into a message in a language. An unknown code becomes `INTERNAL_ERROR`, so nothing internal leaks. |
| `error-catalogue.spec.ts` | Fails the build if a code lacks Arabic or English, if placeholders like `{seconds}` differ between languages, or if the JSON and the constants drift apart. |

How it is used:

```ts
// in any service: only a code, no text
throw new DomainError(ErrorCode.SEATS_UNAVAILABLE);
// the gateway turns it into Arabic or English
```

### 1.2 `envelope/`

The "envelope" is the fixed wrapper around every response, so the frontend handles one shape only.

```json
{
  "success": false,
  "error": { "code": "...", "message": "...", "hint": "...", "details": [ ... ] },
  "meta": { "correlationId": "...", "timestamp": "...", "language": "ar" }
}
```

| Function | Use | HTTP |
|---|---|---|
| `ok(data, ctx)` | normal success | 200 |
| `created(data, ctx)` | something was created | 201 |
| `page(items, paging, ctx)` | a list; `totalPages` is calculated | 200 |
| `fail(code, ctx, params)` | any error, by code | from the catalogue |
| `validationFailed(issues, ctx)` | wrong fields | 400 |

Rules built in:

- No 204. An empty result is `200` with `data: null`, so there is always an envelope.
- Validation errors say which field, which value, and what to do next.
- Secrets (`password`, `code`, `token`, card data) are never echoed back.
- National ID and phone show only the last 4 digits. Email shows as `m***@domain.com`.
- An unknown error becomes `INTERNAL_ERROR`; the hint contains the `correlationId` so the user can quote it to support.

### 1.3 `i18n/`

`resolveLanguage(acceptLanguageHeader)` returns `'ar'` or `'en'`.

| Header | Result |
|---|---|
| `en-GB`, `en-US` | `en` (regional forms count) |
| `ar-EG` | `ar` |
| `fr, en;q=0.8` | `en` (skips unsupported) |
| `en;q=0.5, ar;q=0.9` | `ar` (highest q wins) |
| missing, `fr`, `*`, malformed, too long | `ar` (the one default) |

It never throws, because a bad header must not break a request.

## 4. How the pieces fit together

```
Client request (Accept-Language: en-GB)
        │
        ▼
 resolveLanguage()  →  'en'
        │
 service throws DomainError(SEATS_UNAVAILABLE)
        │
        ▼
 fail(code, { correlationId, language })
        │
        ▼
 { success:false, error:{ code, message (English), hint }, meta:{ ... } }
```

## 5. Decisions made (please confirm)

- Money is integer piastres everywhere. Pounds appear only in the gateway's display.
- Times are stored as UTC. Cairo time is used only for business dates and for display.
- A service never uses a foreign key to another service's data; it stores only the ID.
- Arabic is the default language when the client's language is missing or unsupported.
- Numbers in messages use 0-9 in both languages.
- The outbox uses one relay per service (Postgres advisory lock) so order is kept.
- The verification code travels inside an event to `notification`; it is blanked in the outbox row after publishing.
- BR-27 is read as: one person cannot hold two seats on overlapping segments of one trip.

## 6. Not done yet

- **Gateway wiring** (`apps/gateway`): correlation ID middleware, language middleware with `Content-Language`, global exception filter, response interceptor, `ValidationPipe` mapped to `validationFailed()`. Needs to know if you use Express or Fastify.
- **Outbox and inbox code** in `libs/messaging` (the tables are designed in the PDF, the code is not written).
- **`.proto` contracts**, the endpoint table, the booking saga diagram, the cache plan, and the answers to the nine questions of section 7.2 (these need the requirements document).
- **Docker Compose, health checks, config validation and logging** from the platform story.

## 7. How to check my work

```bash
# inside libs/common, with TypeScript 5.x and jest + ts-jest
npx tsc --noEmit
npx jest
```

Enable `resolveJsonModule` and `esModuleInterop` in `tsconfig.json`. I tested with TypeScript 5; version 7 did not work with `ts-jest` in my environment.
