import { AccessLevel } from "../../applicatoin/enums/access-level.enum";

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    private password: string,
    private confirmPassword: string,
    public isActive: boolean,
    public isVerified: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  getPasswordHash(): string {
    return this.password;
  }
  getConfirmPasswordHash(): string {
    return this.confirmPassword;
  }
  updatePassword(newPasswordHash: string): void {
    this.password = newPasswordHash;
  }

  get accessLevel(): AccessLevel {
    return this.isVerified ? AccessLevel.VERIFIED : AccessLevel.UNVERIFIED;
  }
}
