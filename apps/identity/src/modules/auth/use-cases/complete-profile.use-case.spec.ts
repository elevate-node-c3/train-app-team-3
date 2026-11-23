import { RpcException } from "@nestjs/microservices";
import { User } from "../../users/domain/entities/user.model.entity";
import { UsersService } from "../../users/users.service";
import { CompleteProfileUseCase } from "./complete-profile.use-case";

describe("CompleteProfileUseCase", () => {
  const usersService = {
    findByEmail: jest.fn(),
    isNationalIdUsed: jest.fn(),
    isPhoneUsed: jest.fn(),
    save: jest.fn(),
  };
  const useCase = new CompleteProfileUseCase(
    usersService as unknown as UsersService,
  );
  const request = {
    email: "traveler@example.com",
    fullName: "Traveler Name",
    nationalId: "national-id-123",
    phone: "+201012345678",
    profileType: "traveler",
    nationality: "Example",
  };
  const now = new Date();
  let user: User;

  beforeEach(() => {
    jest.clearAllMocks();
    user = new User(
      "user-id",
      request.email,
      "password-hash",
      true,
      true,
      now,
      now,
    );
    usersService.findByEmail.mockResolvedValue(user);
    usersService.isNationalIdUsed.mockResolvedValue(false);
    usersService.isPhoneUsed.mockResolvedValue(false);
    usersService.save.mockResolvedValue(undefined);
  });

  it("persists the profile and returns exactly the ProfileResponse fields", async () => {
    await expect(useCase.execute(request)).resolves.toEqual({
      userId: user.id,
      fullName: request.fullName,
      egyptianMobileNumber: request.phone,
      nationalId: request.nationalId,
      complete: true,
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith(user.email);
    expect(usersService.isNationalIdUsed).toHaveBeenCalledWith(
      request.nationalId,
      user.id,
    );
    expect(usersService.isPhoneUsed).toHaveBeenCalledWith(
      request.phone,
      user.id,
    );
    expect(usersService.save).toHaveBeenCalledWith(user);
    expect(usersService.findByEmail.mock.invocationCallOrder[0]).toBeLessThan(
      usersService.save.mock.invocationCallOrder[0],
    );
    expect(user.fullName).toBe(request.fullName);
    expect(user.nationalId).toBe(request.nationalId);
    expect(user.phone).toBe(request.phone);
    expect(user.profileType).toBe(request.profileType);
    expect(user.nationality).toBe(request.nationality);
    expect(user.isProfileCompleted).toBe(true);
  });

  it("normalizes valid local Egyptian mobile numbers before saving", async () => {
    await useCase.execute({ ...request, phone: "01012345678" });

    expect(user.phone).toBe("+201012345678");
    expect(usersService.isPhoneUsed).toHaveBeenCalledWith(
      "+201012345678",
      user.id,
    );
  });

  it("returns NOT_FOUND when the user does not exist", async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(request)).rejects.toBeInstanceOf(RpcException);
    expect(usersService.save).not.toHaveBeenCalled();
  });

  it("rejects a user whose profile is already complete", async () => {
    user.isProfileCompleted = true;

    await expect(useCase.execute(request)).rejects.toMatchObject({
      error: {
        code: 9,
        message: "User profile is already complete",
      },
    });

    expect(usersService.isNationalIdUsed).not.toHaveBeenCalled();
    expect(usersService.save).not.toHaveBeenCalled();
  });

  it("rejects unverified users without changing or saving their profile", async () => {
    const unverifiedUser = new User(
      "unverified-user-id",
      request.email,
      "password-hash",
      true,
      false,
      now,
      now,
    );
    usersService.findByEmail.mockResolvedValue(unverifiedUser);

    await expect(useCase.execute(request)).rejects.toMatchObject({
      error: {
        code: 7,
        message: "User must be verified to complete profile",
      },
    });

    expect(usersService.save).not.toHaveBeenCalled();
    expect(unverifiedUser.fullName).toBeNull();
    expect(unverifiedUser.isProfileCompleted).toBe(false);
  });

  it("rejects invalid profile data before checking uniqueness or saving", async () => {
    await expect(
      useCase.execute({ ...request, phone: "12345" }),
    ).rejects.toMatchObject({
      error: {
        code: 3,
        message: "Invalid profile data",
      },
    });

    expect(usersService.isNationalIdUsed).not.toHaveBeenCalled();
    expect(usersService.isPhoneUsed).not.toHaveBeenCalled();
    expect(usersService.save).not.toHaveBeenCalled();
    expect(user.fullName).toBeNull();
  });

  it("rejects a national ID that is already used", async () => {
    usersService.isNationalIdUsed.mockResolvedValue(true);

    await expect(useCase.execute(request)).rejects.toMatchObject({
      error: {
        code: 6,
        message: "National ID is already in use",
      },
    });

    expect(usersService.isPhoneUsed).not.toHaveBeenCalled();
    expect(usersService.save).not.toHaveBeenCalled();
  });

  it("rejects a phone number that is already used", async () => {
    usersService.isPhoneUsed.mockResolvedValue(true);

    await expect(useCase.execute(request)).rejects.toMatchObject({
      error: {
        code: 6,
        message: "Phone number is already in use",
      },
    });

    expect(usersService.save).not.toHaveBeenCalled();
    expect(user.fullName).toBeNull();
  });
});
