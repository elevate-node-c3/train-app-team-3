export const VERIFICATION_CODE_ISSUED_EVENT_KEY =
  "verification-code-issued" as const;

export type VerificationPurpose = "email-verification" | "password-reset";

export interface VerificationCodeIssuedEvent {
  eventId: string;
  type: typeof VERIFICATION_CODE_ISSUED_EVENT_KEY;
  version: 1;
  occurredAt: string;
  correlationId: string;
  producer: "identity";
  payload: {
    email: string;
    code: string;
    language: string;
    purpose: VerificationPurpose;
    expiresAt: string;
  };
}
