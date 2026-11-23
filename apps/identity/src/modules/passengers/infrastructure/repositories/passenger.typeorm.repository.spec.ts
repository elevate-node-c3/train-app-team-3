import { Repository } from "typeorm";
import { PassengerType } from "../../application/enums/passenger-type.enum";
import { PassengerOrmEntity } from "../entities/passenger.typeorm.entity";
import { TypeOrmPassengerRepository } from "./passenger.typeorm.repository";

describe("TypeOrmPassengerRepository", () => {
  const ormRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };
  const repository = new TypeOrmPassengerRepository(
    ormRepository as unknown as Repository<PassengerOrmEntity>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("serializes passenger creation per user and checks the limit before insert", async () => {
    const user = { id: "owner-user-id" };
    const savedEntity = {
      id: "passenger-id",
      fullName: "Passenger Name",
      nationalId: "12345678901234",
      passengerType: PassengerType.REGULAR,
      userId: "owner-user-id",
      user,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    };
    const transactionManager = {
      findOne: jest.fn().mockResolvedValue(user),
      count: jest.fn().mockResolvedValue(9),
      save: jest.fn().mockResolvedValue(savedEntity),
    };
    ormRepository.manager.transaction.mockImplementation(
      (callback: (manager: typeof transactionManager) => unknown) =>
        callback(transactionManager),
    );
    const passenger = {
      id: "passenger-id",
      fullName: "Passenger Name",
      nationalId: "12345678901234",
      passengerType: PassengerType.REGULAR,
      userId: "owner-user-id",
      createdAt: savedEntity.createdAt,
      updatedAt: savedEntity.updatedAt,
    };

    await expect(
      repository.saveIfBelowLimit(passenger, 10),
    ).resolves.toMatchObject({ created: true });

    expect(transactionManager.findOne).toHaveBeenCalledWith(
      expect.any(Function),
      {
        where: { id: "owner-user-id" },
        lock: { mode: "pessimistic_write" },
      },
    );
    expect(transactionManager.count).toHaveBeenCalledWith(
      expect.any(Function),
      { where: { userId: "owner-user-id" } },
    );
    expect(transactionManager.save).toHaveBeenCalledTimes(1);
    expect(transactionManager.findOne.mock.invocationCallOrder[0]).toBeLessThan(
      transactionManager.count.mock.invocationCallOrder[0],
    );
    expect(transactionManager.count.mock.invocationCallOrder[0]).toBeLessThan(
      transactionManager.save.mock.invocationCallOrder[0],
    );
  });

  it("does not insert if the user already has the maximum passengers", async () => {
    const transactionManager = {
      findOne: jest.fn().mockResolvedValue({ id: "owner-user-id" }),
      count: jest.fn().mockResolvedValue(10),
      save: jest.fn(),
    };
    ormRepository.manager.transaction.mockImplementation(
      (callback: (manager: typeof transactionManager) => unknown) =>
        callback(transactionManager),
    );

    await expect(
      repository.saveIfBelowLimit(
        {
          id: "passenger-id",
          fullName: "Passenger Name",
          nationalId: "12345678901234",
          passengerType: PassengerType.REGULAR,
          userId: "owner-user-id",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        10,
      ),
    ).resolves.toEqual({ created: false, reason: "limit_reached" });
    expect(transactionManager.save).not.toHaveBeenCalled();
  });

  it("only queries passengers owned by the requested user", async () => {
    ormRepository.find.mockResolvedValue([
      {
        id: "passenger-id",
        fullName: "Passenger Name",
        nationalId: "12345678901234",
        passengerType: PassengerType.REGULAR,
        userId: "owner-user-id",
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
      },
    ]);

    await expect(
      repository.findByUserId("owner-user-id"),
    ).resolves.toMatchObject([
      {
        id: "passenger-id",
        userId: "owner-user-id",
      },
    ]);
    expect(ormRepository.find).toHaveBeenCalledWith({
      where: { userId: "owner-user-id" },
      order: { createdAt: "ASC" },
    });
  });

  it("scopes single-passenger reads and deletes to the owner", async () => {
    ormRepository.findOneBy.mockResolvedValue(null);
    ormRepository.delete.mockResolvedValue({ affected: 0 });

    await expect(
      repository.findByIdForUser("passenger-id", "owner-user-id"),
    ).resolves.toBeNull();
    expect(ormRepository.findOneBy).toHaveBeenCalledWith({
      id: "passenger-id",
      userId: "owner-user-id",
    });

    await expect(
      repository.deleteByIdForUser("passenger-id", "owner-user-id"),
    ).resolves.toBe(false);
    expect(ormRepository.delete).toHaveBeenCalledWith({
      id: "passenger-id",
      userId: "owner-user-id",
    });
  });
});
