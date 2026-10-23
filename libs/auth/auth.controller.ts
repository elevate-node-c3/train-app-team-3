import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod("IdentityService", "Register")
  async register(data: RegisterDto) {
    return this.authService.register(data);
  }

  @GrpcMethod("IdentityService", "Login")
  async login(data: LoginDto) {
    return this.authService.login(data);
  }
}
