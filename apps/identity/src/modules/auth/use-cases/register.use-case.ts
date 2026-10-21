import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { UsersService } from '../../users/users.service';
import { RegisterDto } from '../dtos/register.dto';

@Injectable()
export class RegisterUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async execute(dto: RegisterDto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            throw new RpcException({
                code: status.ALREADY_EXISTS,
                message: 'Email already exists',
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(dto.password, salt);

        const user = await this.usersService.create({
            email: dto.email,
            passwordHash,
        });

        const accessToken = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });

        return {
            id: user.id,
            email: user.email,
            accessToken,
        };
    }
}