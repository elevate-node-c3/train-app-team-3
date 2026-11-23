import { status } from "@grpc/grpc-js";
import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { validateSync } from "class-validator";
import { CompleteProfileDto } from "../../users/applicatoin/dtos/complete-profile.dto";
import { UsersService } from "../../users/users.service";

@Injectable()
export class CompleteProfileUseCase {
  constructor(private readonly usersService: UsersService) {}

  async execute(dto: CompleteProfileDto) {
    const validationErrors = validateSync(
      Object.assign(new CompleteProfileDto(), dto),
      { whitelist: true, forbidNonWhitelisted: true },
    );
    if (validationErrors.length > 0) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: "Invalid profile data",
      });
    }

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: "User must be verified to complete profile",
      });
    }
    if (user.isProfileCompleted) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: "User profile is already complete",
      });
    }

    const fullName = dto.fullName.trim();
    const nationalId = dto.nationalId.trim();
    const profileType = dto.profileType.trim();
    const nationality = dto.nationality.trim();
    const phone = this.normalizeEgyptianPhone(dto.phone.trim());

    if (await this.usersService.isNationalIdUsed(nationalId, user.id)) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: "National ID is already in use",
      });
    }
    if (await this.usersService.isPhoneUsed(phone, user.id)) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: "Phone number is already in use",
      });
    }

    user.completeProfile({
      fullName,
      nationalId,
      phone,
      profileType,
      nationality,
    });
    await this.usersService.save(user);

    return {
      userId: user.id,
      fullName: user.fullName ?? "",
      egyptianMobileNumber: user.phone ?? "",
      nationalId: user.nationalId ?? "",
      complete: user.isProfileCompleted ?? false,
    };
  }

  private normalizeEgyptianPhone(phone: string): string {
    if (phone.startsWith("+20")) {
      return phone;
    }
    if (phone.startsWith("0020")) {
      return `+${phone.slice(2)}`;
    }
    if (phone.startsWith("0")) {
      return `+20${phone.slice(1)}`;
    }
    return `+20${phone}`;
  }
}
