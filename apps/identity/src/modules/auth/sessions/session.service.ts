import { Inject, Injectable } from "@nestjs/common";
import { Session } from "./domain/entities/session.entity";
import {
  SESSION_REPOSITORY,
  SessionRepository,
} from "./domain/repository/session.repo";
import { CreateSessionInput } from "./application/session.interface";

@Injectable()
export class SessionService {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async create(input: CreateSessionInput): Promise<Session> {
    const now = new Date();
    return this.sessionRepository.save(
      new Session(
        input.sessionId,
        input.userId,
        input.deviceInfo,
        false,
        input.expiresAt,
        now,
        now,
      ),
    );
  }

  async findActive(
    sessionId: string,
    userId: string,
    at: Date = new Date(),
  ): Promise<Session | null> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session || session.userId !== userId || !session.isActive(at)) {
      return null;
    }
    return session;
  }

  async isActive(
    sessionId: string,
    userId: string,
    at: Date = new Date(),
  ): Promise<boolean> {
    return Boolean(await this.findActive(sessionId, userId, at));
  }

  async revoke(
    sessionId: string,
    userId: string,
    at: Date = new Date(),
  ): Promise<boolean> {
    const session = await this.findActive(sessionId, userId, at);
    if (!session || !session.revoke(at)) {
      return false;
    }
    return this.sessionRepository.revoke(sessionId, userId, at);
  }
}
