import { User } from "../../domain/entities/user.model.entity";
import { UserOrmEntity } from "../entities/user.typeorm.entity";
import { UserMapper } from "./user.mapper";

describe("UserMapper verification status", () => {
  const now = new Date();

  it("restores verification status from the ORM entity", () => {
    const ormEntity = Object.assign(new UserOrmEntity(), {
      id: "user-id",
      email: "traveler@example.com",
      passwordHash: "password-hash",
      lang: "en",
      isVerified: true,
      fullName: null,
      nationalId: null,
      phone: null,
      profileType: null,
      nationality: null,
      isProfileCompleted: false,
      createdAt: now,
      updatedAt: now,
    });

    expect(UserMapper.toDomain(ormEntity).isVerified).toBe(true);
  });

  it("persists verification status to the ORM entity", () => {
    const user = new User(
      "user-id",
      "traveler@example.com",
      "password-hash",
      true,
      true,
      now,
      now,
    );

    expect(UserMapper.toOrmEntity(user).isVerified).toBe(true);
  });
});
