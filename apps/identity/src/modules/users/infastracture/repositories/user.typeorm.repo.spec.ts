import { Repository } from "typeorm";
import { UserOrmEntity } from "../entities/user.typeorm.entity";
import { TypeOrmUserRepository } from "./user.typeorm.repo";

describe("TypeOrmUserRepository", () => {
  const ormRepository = {
    exist: jest.fn(),
  };
  const repository = new TypeOrmUserRepository(
    ormRepository as unknown as Repository<UserOrmEntity>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("checks national IDs across ASCII, Arabic, and Persian digit formats", async () => {
    ormRepository.exist.mockResolvedValue(true);

    await expect(
      repository.isNationalIdUsed("١٢٣٤٥٦٧٨٩٠١٢٣٤", "current-user-id"),
    ).resolves.toBe(true);

    const [criteria] = ormRepository.exist.mock.calls[0];
    expect(criteria.where).toHaveLength(3);
    expect(criteria.where).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nationalId: "12345678901234" }),
        expect.objectContaining({ nationalId: "١٢٣٤٥٦٧٨٩٠١٢٣٤" }),
        expect.objectContaining({ nationalId: "۱۲۳۴۵۶۷۸۹۰۱۲۳۴" }),
      ]),
    );
    for (const condition of criteria.where) {
      expect(condition.id).toBeDefined();
    }
  });
});
