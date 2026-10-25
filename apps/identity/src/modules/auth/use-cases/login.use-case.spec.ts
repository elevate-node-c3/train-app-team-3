import * as bcrypt from "bcrypt";
import { User } from "../../users/domain/entities/user.model.entity";
import { LoginDto } from "../../users/applicatoin/dtos/login.dto";
import { UsersService } from "../../users/users.service";
import { CreateSessionUseCase } from "./create-session.use-case";
import { LoginUseCase } from "./login.use-case";

describe("LoginUseCase", () => {
  let user: User;
  let useCase: LoginUseCase;
  const usersService = {
    findByEmail: jest.fn(),
  };
  const createSessionUseCase = {
    execute: jest.fn(),
  };

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("correct-password", 4);
    user = new User(
      "user-id",
      "traveler@example.com",
      passwordHash,
      true,
      false,
      new Date("2026-01-01T00:00:00.000Z"),
      new Date("2026-01-01T00:00:00.000Z"),
    );
    useCase = new LoginUseCase(
      usersService as unknown as UsersService,
      createSessionUseCase as unknown as CreateSessionUseCase,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    usersService.findByEmail.mockResolvedValue(user);
    createSessionUseCase.execute.mockResolvedValue({
      accessToken: "signed-access-token",
    });
  });

  it("delegates token and session creation and returns the access token", async () => {
    const dto: LoginDto = {
      email: "traveler@example.com",
      password: "correct-password",
      deviceInfo: "browser",
    };

    await expect(useCase.execute(dto)).resolves.toEqual({
      id: user.id,
      email: user.email,
      accessToken: "signed-access-token",
    });

    expect(createSessionUseCase.execute).toHaveBeenCalledWith({
      userId: user.id,
      email: user.email,
      deviceInfo: "browser",
    });
  });

  it("does not create a session when the password is invalid", async () => {
    await expect(
      useCase.execute({
        email: "traveler@example.com",
        password: "wrong-password",
      }),
    ).rejects.toThrow("Invalid email or password");
    expect(createSessionUseCase.execute).not.toHaveBeenCalled();
  });
});
