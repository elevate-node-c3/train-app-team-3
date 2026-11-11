import { RpcException } from "@nestjs/microservices";
import { I18nService } from "nestjs-i18n";
import { User } from "../users/domain/entities/user.model.entity";
import { UsersService } from "../users/users.service";
import { PassengerType } from "./application/enums/passenger-type.enum";
import { PassengerRepository } from "./domain/repositories/passenger.repository";
import { PassengersService } from "./passengers.service";

describe("PassengersService", () => {
  const passengerRepository = {
    save: jest.fn(),
    saveIfBelowLimit: jest.fn(),
    findByUserId: jest.fn(),
    findByIdForUser: jest.fn(),
    findByNationalIdForUser: jest.fn(),
    deleteByIdForUser: jest.fn(),
  };
  const usersService = {
    findById: jest.fn(),
    isNationalIdUsed: jest.fn(),
  };
  const i18n = { translate: jest.fn((key: string) => key) };
  const service = new PassengersService(
    passengerRepository as unknown as PassengerRepository,
    usersService as unknown as UsersService,
    i18n as unknown as I18nService,
  );
  const now = new Date();
  const createInput = {
    fullName: "Passenger Name",
    nationalId: "١٢٣٤٥٦٧٨٩٠١٢٣٤",
    passengerType: PassengerType.REGULAR,
    userId: "owner-user-id",
  };
  let owner: User;

  beforeEach(() => {
    jest.clearAllMocks();
    owner = new User(
      "owner-user-id",
      "owner@example.com",
      "password-hash",
      true,
      true,
      now,
      now,
    );
    usersService.findById.mockResolvedValue(owner);
    usersService.isNationalIdUsed.mockResolvedValue(false);
    passengerRepository.findByNationalIdForUser.mockResolvedValue(null);
    passengerRepository.save.mockImplementation(
      async (passenger: unknown) => passenger,
    );
    passengerRepository.saveIfBelowLimit.mockImplementation(
      async (passenger: unknown) => ({ created: true, passenger }),
    );
  });

  it("creates a passenger owned by the user and canonicalizes Arabic digits", async () => {
    const passenger = await service.create(createInput, "en");

    expect(passenger).toMatchObject({
      nationalId: "12345678901234",
      userId: owner.id,
      passengerType: PassengerType.REGULAR,
    });
    expect(passengerRepository.saveIfBelowLimit).toHaveBeenCalledWith(
      passenger,
      10,
    );
  });

  it("rejects creating the authenticated user as a separate passenger", async () => {
    owner.nationalId = "12345678901234";

    await expect(service.create(createInput, "en")).rejects.toMatchObject({
      error: { code: 6, message: "passengers.selfPassenger" },
    });
    expect(passengerRepository.saveIfBelowLimit).not.toHaveBeenCalled();
  });

  it("rejects a national ID belonging to another user account", async () => {
    usersService.isNationalIdUsed.mockResolvedValue(true);

    await expect(service.create(createInput, "en")).rejects.toBeInstanceOf(
      RpcException,
    );
    expect(passengerRepository.saveIfBelowLimit).not.toHaveBeenCalled();
  });

  it("rejects creating an eleventh passenger for a user", async () => {
    passengerRepository.saveIfBelowLimit.mockResolvedValue({
      created: false,
      reason: "limit_reached",
    });

    await expect(service.create(createInput, "en")).rejects.toMatchObject({
      error: { code: 8, message: "passengers.limitReached" },
    });
  });

  it("returns not found when a passenger is not owned by the requester", async () => {
    passengerRepository.findByIdForUser.mockResolvedValue(null);

    await expect(
      service.findByIdForUser("passenger-id", owner.id, "en"),
    ).rejects.toMatchObject({
      error: { code: 5, message: "passengers.notFound" },
    });
  });

  it("only deletes a passenger through the owner-scoped repository method", async () => {
    passengerRepository.deleteByIdForUser.mockResolvedValue(true);

    await expect(
      service.deleteForUser("passenger-id", owner.id, "en"),
    ).resolves.toBeUndefined();
    expect(passengerRepository.deleteByIdForUser).toHaveBeenCalledWith(
      "passenger-id",
      owner.id,
    );
  });
});
