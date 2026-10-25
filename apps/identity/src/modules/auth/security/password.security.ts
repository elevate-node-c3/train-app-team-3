import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";

const saltRounds = 12; // Recommended production minimum

@Injectable()
export class SecurityPasswordService {
  constructor() {}
  // HASH A PASSWORD (Registration)
  async hashPassword(
    plainTextPassword: string,
    saltRounds: number,
  ): Promise<string> {
    const hash = await bcrypt.hash(plainTextPassword, saltRounds);
    return hash; // Store this string in your database
  }

  // VERIFY A PASSWORD (Login)
  async verifyPassword(
    hashedPasswordFromDb: string,
    plainTextPassword: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(
      plainTextPassword,
      hashedPasswordFromDb,
    );
    return isMatch; // Returns true or false
  }
}
