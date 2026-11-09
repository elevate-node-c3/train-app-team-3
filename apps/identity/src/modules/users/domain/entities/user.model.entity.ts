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
    public lang: string = "ar",
    public fullName: string | null = null,
    public nationalId: string | null = null,
    public phone: string | null = null,
    public profileType: string | null = null,
    public nationality: string | null = null,
    public isProfileCompleted: boolean = false,
  ) {}

  completeProfile(profile: {
    fullName: string;
    nationalId: string;
    phone: string;
    profileType: string;
    nationality: string;
  }): void {
    this.fullName = profile.fullName;
    this.nationalId = profile.nationalId;
    this.phone = profile.phone;
    this.profileType = profile.profileType;
    this.nationality = profile.nationality;
    this.isProfileCompleted = true;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }
  updatePassword(newPasswordHash: string): void {
    this.passwordHash = newPasswordHash;
  }

  get accessLevel(): AccessLevel {
    return this.isVerified ? AccessLevel.VERIFIED : AccessLevel.UNVERIFIED;
  }
}
