import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { UsersService } from '../../users/users.service';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class LoginUseCase {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async execute(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            throw new RpcException({
                code: status.UNAUTHENTICATED,
                message: 'Invalid email or password',
            });
        }

        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new RpcException({
                code: status.UNAUTHENTICATED,
                message: 'Invalid email or password',
            });
        }

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