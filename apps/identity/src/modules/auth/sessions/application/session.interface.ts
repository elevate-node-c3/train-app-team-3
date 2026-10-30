export interface CreateSessionInput {
  sessionId: string;
  userId: string;
  deviceInfo: string | null;
  expiresAt: Date;
}