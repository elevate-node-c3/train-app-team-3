export class Session {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly deviceInfo: string | null,
    public revoked: boolean,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  isActive(at: Date = new Date()): boolean {
    return !this.revoked && this.expiresAt > at;
  }

  revoke(at: Date = new Date()): boolean {
    if (!this.isActive(at)) {
      return false;
    }

    this.revoked = true;
    this.updatedAt = at;
    return true;
  }
}
