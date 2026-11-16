import { validateSync } from "class-validator";
import { ForgotPasswordDto } from "./forgot-password.dto";
import { LoginInDto } from "./loginin.dto";
import { RegisterDto } from "./register.dto";
import { VerifyOtpDto } from "./verify-otp.dto";

function validate<T extends object>(dto: new () => T, input: object) {
  return validateSync(Object.assign(new dto(), input));
}

describe("auth email and password length validation", () => {
  it("rejects email and password values below their minimum lengths", () => {
    const errors = validate(RegisterDto, {
      email: "a@b",
      password: "short7",
      confirmPassword: "short7",
    });

    expect(errors.find((error) => error.property === "email")?.constraints)
      .toHaveProperty("minLength");
    expect(errors.find((error) => error.property === "password")?.constraints)
      .toHaveProperty("minLength");
  });

  it("rejects email and password values above their maximum lengths", () => {
    const errors = validate(LoginInDto, {
      email: `${"a".repeat(243)}@example.com`,
      password: "x".repeat(73),
    });

    expect(errors.find((error) => error.property === "email")?.constraints)
      .toHaveProperty("maxLength");
    expect(errors.find((error) => error.property === "password")?.constraints)
      .toHaveProperty("maxLength");
  });

  it("applies email length limits to password-recovery and OTP routes", () => {
    for (const dto of [ForgotPasswordDto, VerifyOtpDto]) {
      const errors = validate(dto, {
        email: "a@b",
        otp: "123456",
      });

      expect(errors.find((error) => error.property === "email")?.constraints)
        .toHaveProperty("minLength");
    }
  });
});
