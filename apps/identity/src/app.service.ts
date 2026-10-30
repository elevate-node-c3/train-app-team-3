import { Injectable } from "@nestjs/common";
import { LoginDto } from "./modules/users/applicatoin/dtos/login.dto";
import { AuthService } from "./modules/auth/auth.service";
import { LoginResponse } from "./modules/users/applicatoin/dtos/login.response";
import { RegisterDto } from "./modules/users/applicatoin/dtos/register.dto";

@Injectable()
export class IdentityService {
  constructor(private readonly authService: AuthService) {}
  async register(RegisterReuest: RegisterDto): Promise<LoginResponse> {
    return await this.authService.register(RegisterReuest);
  }
  async login(LoginRequest: LoginDto): Promise<LoginResponse> {
    return await this.authService.login(LoginRequest);
  }
}
