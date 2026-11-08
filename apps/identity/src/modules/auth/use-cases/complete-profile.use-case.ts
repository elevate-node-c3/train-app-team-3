import { status } from "@grpc/grpc-js";
import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { CompleteProfileDto } from "../../users/applicatoin/dtos/complete-profile.dto";
import { UsersService } from "../../users/users.service";
import { CreateSessionUseCase } from "./create-session.use-case";

@Injectable()
export class CompleteProfileUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  async execute(dto: CompleteProfileDto) {
    const user = await this.usersService.completeProfile(dto.email, {
      fullName: dto.fullName,
      nationalId: dto.nationalId,
      phone: dto.phone,
      profileType: dto.profileType,
      nationality: dto.nationality,
    });
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: "User not found",
      });
    }

    const session = await this.createSessionUseCase.execute({
      userId: user.id,
      email: user.email,
    });

    return {
      id: user.id,
      email: user.email,
      isProfileCompleted: user.isProfileCompleted,
      accessToken: session.accessToken,
    };
  }
}
