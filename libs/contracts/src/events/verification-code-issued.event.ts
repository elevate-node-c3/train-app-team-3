export type VerificationPurpose = 'email-verification' | 'password-reset';

export interface VerificationCodeIssuedEvent {
  eventId: string;
  type: 'traveller.verification-code.issued';
  version: 1;
  occurredAt: string;
  correlationId: string;
  producer: 'identity';
  payload: {
    userId: string;
    email: string;
    code: string;
    language: string;
    purpose: VerificationPurpose;
    expiresAt: string;
  };
}
