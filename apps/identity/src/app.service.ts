import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { UsersService } from "./modules/users/users.service";
import { LoginDto } from "./modules/users/applicatoin/dtos/login.dto";
import { SecurityPasswordService } from "./modules/auth/security/password.security";
import { IToken } from "libs/auth/token/token.interfaces";
import { randomUUID } from "crypto";
import { AuthService } from "./modules/auth/auth.service";
import { LoginResponse } from "./modules/users/applicatoin/dtos/login.response";

@Injectable()
export class IdentityService {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly securityPasswordService: SecurityPasswordService,
  ) {}

  async login(LoginRequest: LoginDto): Promise<LoginResponse> {
    return await this.authService.login(LoginRequest);
  }
}
