<<<<<<< Updated upstream
import { UsersService } from "../../users/users.service";
import { CreateSessionUseCase } from "./create-session.use-case";
import { RegisterUseCase } from "./register.use-case";
import { I18nService } from "nestjs-i18n";

const translations: Record<string, string> = {
  "auth.emailAlreadyExists": "هذا البريد الإلكتروني مسجل بالفعل",
};

describe("RegisterUseCase", () => {
  const i18n = {
    translate: jest.fn((key: string) => translations[key]),
  };
=======
import { RpcException } from "@nestjs/microservices";
import { UsersService } from "../../users/users.service";
import { CreateSessionUseCase } from "./create-session.use-case";
import { RegisterUseCase } from "./register.use-case";

describe("RegisterUseCase", () => {
>>>>>>> Stashed changes
  const usersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const createSessionUseCase = {
    execute: jest.fn(),
  };
  const useCase = new RegisterUseCase(
    usersService as unknown as UsersService,
    createSessionUseCase as unknown as CreateSessionUseCase,
<<<<<<< Updated upstream
    i18n as unknown as I18nService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    i18n.translate.mockImplementation((key: string) => translations[key]);
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({
      id: "user-id",
      email: "traveler@example.com",
    });
    createSessionUseCase.execute.mockResolvedValue({
      accessToken: "signed-access-token",
    });
  });

  it("stores the selected language on the account", async () => {
    await useCase.execute(
      {
        email: "traveler@example.com",
        password: "password",
      },
      "en",
    );

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ lang: "en" }),
    );
  });

  it("translates registration errors using the request language", async () => {
    usersService.findByEmail.mockResolvedValue({
      id: "user-id",
      email: "traveler@example.com",
    });

    await expect(
      useCase.execute(
        {
          email: "traveler@example.com",
          password: "password",
        },
        "ar",
      ),
    ).rejects.toMatchObject({
      message: "هذا البريد الإلكتروني مسجل بالفعل",
    });
=======
  );
  const user = { id: "user-id", email: "traveler@example.com" };

  beforeEach(() => {
    jest.clearAllMocks();
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue(user);
    createSessionUseCase.execute.mockResolvedValue({
      accessToken: "access-token",
    });
  });

  it("returns exactly the RegisterResponse fields", async () => {
    await expect(
      useCase.execute({
        email: user.email,
        password: "secret",
      }),
    ).resolves.toEqual({
      id: user.id,
      email: user.email,
      accessToken: "access-token",
    });

    expect(usersService.create).toHaveBeenCalledWith({
      email: user.email,
      passwordHash: expect.any(String),
    });
    expect(createSessionUseCase.execute).toHaveBeenCalledWith({
      userId: user.id,
      email: user.email,
      deviceInfo: null,
    });
  });

  it("rejects an existing email without creating a session", async () => {
    usersService.findByEmail.mockResolvedValue(user);

    await expect(
      useCase.execute({ email: user.email, password: "secret" }),
    ).rejects.toBeInstanceOf(RpcException);
    expect(usersService.create).not.toHaveBeenCalled();
    expect(createSessionUseCase.execute).not.toHaveBeenCalled();
>>>>>>> Stashed changes
  });
});
