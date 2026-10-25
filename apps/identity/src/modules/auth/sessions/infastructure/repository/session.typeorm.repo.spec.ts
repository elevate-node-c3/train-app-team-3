import { Repository } from "typeorm";
import { Session } from "../../domain/entities/session.entity";
import { SessionOrmEntity } from "../entities/session.typeorm.entity";
import { TypeOrmSessionRepository } from "./session.typeorm.repo";

describe("TypeOrmSessionRepository", () => {
  const ormRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
  };
  const repository = new TypeOrmSessionRepository(
    ormRepository as unknown as Repository<SessionOrmEntity>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persists domain sessions and maps the saved entity back to domain", async () => {
    const session = new Session(
      "session-id",
      "user-id",
      "browser",
      false,
      new Date(Date.now() + 60_000),
      new Date(),
      new Date(),
    );
    ormRepository.save.mockImplementation(async (entity: SessionOrmEntity) => entity);

    await expect(repository.save(session)).resolves.toMatchObject({
      id: "session-id",
      userId: "user-id",
      deviceInfo: "browser",
      revoked: false,
    });
    expect(ormRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
      }),
    );
  });

  it("revokes only an unrevoked, unexpired session belonging to the user", async () => {
    const now = new Date();
    ormRepository.update.mockResolvedValue({ affected: 1 });

    await expect(
      repository.revoke("session-id", "user-id", now),
    ).resolves.toBe(true);

    const [criteria, update] = ormRepository.update.mock.calls[0];
    expect(criteria).toMatchObject({
      id: "session-id",
      userId: "user-id",
      revoked: false,
    });
    expect(criteria.expiresAt).toBeDefined();
    expect(update).toEqual({ revoked: true, updatedAt: now });
  });
});
