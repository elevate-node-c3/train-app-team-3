import { AccessLevel } from "../../applicatoin/enums/access-level.enum";

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    private passwordHash: string,
    public isActive: boolean,
    public isVerified: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  getPasswordHash(): string {
    return this.passwordHash;
  }
  updatePassword(newPasswordHash: string): void {
    this.passwordHash = newPasswordHash;
  }
}
