import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { RpcException } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";
import { UsersService } from "../../users/users.service";
import { LoginDto } from "../../users/applicatoin/dtos/login.dto";
import { CreateSessionUseCase } from "./create-session.use-case";

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  async execute(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(dto.password, user.getPasswordHash());
    if (!isMatch) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: "Invalid email or password",
      });
    }
    const session = await this.createSessionUseCase.execute({
      userId: user.id,
      email: user.email,
      deviceInfo: dto.deviceInfo ?? null,
    });
    return {
      id: user.id,
      email: user.email,
      accessToken: session.accessToken,
    };
  }
}
