import { Injectable, Inject } from "@nestjs/common";
import { createHash, randomInt } from "crypto";
import * as bcrypt from "bcrypt";

export interface RedisLike {
  multi: (...args: any[]) => any;
  eval: (
    script: string,
    numberOfKeys: number,
    ...args: unknown[]
  ) => Promise<unknown>;
  set: (...args: any[]) => Promise<unknown>;
  get: (key: string) => Promise<string | null>;
  del: (key: string) => Promise<number>;
  ttl: (key: string) => Promise<number>;
}

const OTP_TTL_SECONDS = 300;

@Injectable()
export class OtpService {
  constructor(@Inject("REDIS_CLIENT") private readonly redis: RedisLike) {}

  generate(length = 6): string {
    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;
    return randomInt(min, max + 1).toString().padStart(length, "0");
  }

  private emailKey(email: string): string {
    return createHash("sha256").update(email.trim()).digest("hex");
  }

  async issue(email: string): Promise<string> {
    const code = this.generate(6);
    const key = `otp:email-verification:${this.emailKey(email)}:code`;
    const attemptsKey = `otp:email-verification:${this.emailKey(email)}:attempts`;

    const tx = this.redis.multi();
    tx.set(key, code, "EX", OTP_TTL_SECONDS);
    tx.del(attemptsKey);
    await tx.exec();

    return code;
  }

  async verify(email: string, code: string): Promise<boolean> {
    if (!/^\d{6}$/.test(code)) {
      return false;
    }

    const key = `otp:email-verification:${this.emailKey(email)}:code`;
    const attemptsKey = `otp:email-verification:${this.emailKey(email)}:attempts`;

    const result = await this.redis.eval(
      `
        local current = redis.call('GET', KEYS[1])
        if not current then return 0 end
        local attempts = tonumber(redis.call('GET', KEYS[2]) or '0')
        if current == ARGV[1] then
          redis.call('DEL', KEYS[1], KEYS[2])
          return 1
        end
        redis.call('SET', KEYS[2], attempts + 1, 'EX', 300)
        return 0
      `,
      2,
      key,
      attemptsKey,
      code,
      5,
    );

    return result === 1;
  }

  async create(userId: string, subject: string, replaceCurrent = true): Promise<string> {
    const otp = this.generate(6);
    const otpKey = `user:${userId}:OTP:${subject}`;
    const currentOtpTtl = await this.redis.ttl(otpKey);

    if (currentOtpTtl > 0 && !replaceCurrent) {
      throw new Error("Please wait before requesting a new code");
    }

    const hashedOtp = await bcrypt.hash(otp, 10);
    await this.redis.set(
      otpKey,
      JSON.stringify({ hashedOtp, attempts: 0 }),
      "EX",
      OTP_TTL_SECONDS,
    );

    return otp;
  }

  async verifyUserOtp(userId: string, subject: string, otp: string): Promise<boolean> {
    const otpKey = `user:${userId}:OTP:${subject}`;
    const stored = await this.redis.get(otpKey);

    if (!stored) {
      return false;
    }

    try {
      const parsed = JSON.parse(stored) as { hashedOtp?: string };
      if (!parsed.hashedOtp) {
        return false;
      }

      const isValid = await bcrypt.compare(otp, parsed.hashedOtp);
      if (isValid) {
        await this.redis.del(otpKey);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}
