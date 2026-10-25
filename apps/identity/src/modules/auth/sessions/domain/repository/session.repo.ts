import { Session } from "../entities/session.entity";

export interface SessionRepository {
  save(session: Session): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  revoke(id: string, userId: string, at: Date): Promise<boolean>;
}

export const SESSION_REPOSITORY = Symbol("SESSION_REPOSITORY");