import { RpcException } from "@nestjs/microservices";
import { UsersService } from "../../users/users.service";
import { CreateSessionUseCase } from "./create-session.use-case";
import { CompleteProfileUseCase } from "./complete-profile.use-case";

describe("CompleteProfileUseCase", () => {
  const usersService = {
    completeProfile: jest.fn(),
  };
  const createSessionUseCase = {
    execute: jest.fn(),
  };
  const useCase = new CompleteProfileUseCase(
    usersService as unknown as UsersService,
    createSessionUseCase as unknown as CreateSessionUseCase,
  );
  const request = {
    email: "traveler@example.com",
    fullName: "Traveler Name",
    nationalId: "national-id",
    phone: "+123456789",
    profileType: "traveler",
    nationality: "Example",
  };
  const user = {
    id: "user-id",
    email: request.email,
    isProfileCompleted: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usersService.completeProfile.mockResolvedValue(user);
    createSessionUseCase.execute.mockResolvedValue({
      accessToken: "access-token",
    });
  });

  it("persists the profile and returns exactly the CompleteProfileResponse fields", async () => {
    await expect(useCase.execute(request)).resolves.toEqual({
      id: user.id,
      email: user.email,
      isProfileCompleted: true,
      accessToken: "access-token",
    });

    expect(usersService.completeProfile).toHaveBeenCalledWith(user.email, {
      fullName: request.fullName,
      nationalId: request.nationalId,
      phone: request.phone,
      profileType: request.profileType,
      nationality: request.nationality,
    });
    expect(createSessionUseCase.execute).toHaveBeenCalledWith({
      userId: user.id,
      email: user.email,
    });
  });

  it("returns NOT_FOUND without creating a session when the user does not exist", async () => {
    usersService.completeProfile.mockResolvedValue(null);

    await expect(useCase.execute(request)).rejects.toBeInstanceOf(RpcException);
    expect(createSessionUseCase.execute).not.toHaveBeenCalled();
  });
});
