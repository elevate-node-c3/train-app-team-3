import { Injectable } from "@nestjs/common";
import { generateOtp } from "./utils/generate.otp";
import { CacheService } from "libs/cache/src";
import { TooManyRequestsException } from "libs/excptions/too-many-requests.exception";

const OTP_TTL_MS = 30 * 1000;
const OTP_VERIFIED_TTL_MS = 10 * 60 * 1000;
const OTP_BLOCK_TTL_MS = 7 * 1000;
const OTP_RESEND_COOLDOWN_MS = 10 * 1000;
const OTP_RESEND_WINDOW_MS = 60 * 60 * 1000;
const MAX_RESENDS_PER_WINDOW = 5;
const MAX_ATTEMPTS = 5;

@Injectable()
export class OtpService {
  constructor(private readonly cacheService: CacheService) {}

  async create(
    userId: string,
    subject: string,
    replaceCurrent = true,
  ): Promise<string> {
    // const blockTtl = await this.redisService.getTTL(
    //   this.redisService.otpKeyBlock({ userId, subject }),
    // );

    // if (blockTtl > 0) {
    //   throw new TooManyRequestsException(
    //     `Too many requests. Please try again in ${Math.ceil(blockTtl / 1000 / 60)} minutes`,
    //   );
    // }

    const otpKey = `user:${userId}:OTP:${subject}`;

    // const otpCache = await this.redisService.get(otpKey);

    const currentOtpTtl = await this.cacheService.getTTL(otpKey);

    if (currentOtpTtl > 0 && !replaceCurrent) {
      throw new TooManyRequestsException(
        `Please wait ${Math.ceil(currentOtpTtl / 1000 / 60)} minutes before requesting a new code`,
      );
    }

    // if (replaceCurrent) {
    //   const cooldownKey = this.redisService.otpKeyCooldown({ userId, subject });
    //   const cooldownTtl = await this.redisService.getTTL(cooldownKey);
    //   if (cooldownTtl > 0)
    //     throw new TooManyRequestsException(
    //       `Please wait ${Math.ceil(cooldownTtl / 1000)} seconds before requesting a new code`,
    //     );

    //   const penaltyKey = this.redisService.otpKeyPenalty({ userId, subject });
    //   const sendRecord = (await this.redisService.get<OtpSendRecord>(
    //     penaltyKey,
    //   )) ?? { count: 0 };
    //   if (sendRecord.count >= MAX_RESENDS_PER_WINDOW) {
    //     throw new TooManyRequestsException(
    //       "Too many verification code requests. Please try again later",
    //     );
    //   }

    //   await Promise.all([
    //     this.redisService.del(otpKey),
    //     this.redisService.set(cooldownKey, 1, OTP_RESEND_COOLDOWN_MS),
    //     this.redisService.set(
    //       penaltyKey,
    //       { count: sendRecord.count + 1 },
    //       OTP_RESEND_WINDOW_MS,
    //     ),
    //   ]);
    // }

    const otp = generateOtp();

    await this.cacheService.set(
      otpKey,
      { hashedOtp: await this.securityService.hash(otp), attempts: 0 },
      OTP_TTL_MS,
    );

    return otp;
  }
}
