import { Injectable } from '@nestjs/common';
import { RegisterUseCase } from './use-cases/register.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly registerUseCase: RegisterUseCase,
        private readonly loginUseCase: LoginUseCase,
    ) { }

    async register(dto: RegisterDto) {
        return this.registerUseCase.execute(dto);
    }

    async login(dto: LoginDto) {
        return this.loginUseCase.execute(dto);
    }
}