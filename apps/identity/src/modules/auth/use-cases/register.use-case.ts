import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode } from '@app/common';
import { UsersRepository } from '../../users/users.repository';
import { RegisterDto, RegisterResponseDto } from '../dtos/register.dto';

@Injectable()
export class RegisterUseCase {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly jwtService: JwtService,
    ) { }

    async execute(dto: RegisterDto): Promise<RegisterResponseDto> {
        console.log('--- RegisterUseCase EXECUTING with email:', dto.email);
        const emailExists = await this.usersRepository.findByEmail(dto.email);
        if (emailExists) {
            throw new RpcException({
                code: status.ALREADY_EXISTS,
                message: JSON.stringify({ code: ErrorCode.AUTH_EMAIL_TAKEN }),
            });
        }
        console.log('--- Email exists check result:', emailExists);

        const phoneExists = await this.usersRepository.findByPhone(dto.phone);
        if (phoneExists) {
            throw new RpcException({
                code: status.ALREADY_EXISTS,
                message: JSON.stringify({ code: ErrorCode.AUTH_PHONE_TAKEN }),
            });
        }

        const nationalIdExists = await this.usersRepository.findByNationalId(dto.nationalId);
        if (nationalIdExists) {
            throw new RpcException({
                code: status.ALREADY_EXISTS,
                message: JSON.stringify({ code: ErrorCode.AUTH_NATIONAL_ID_TAKEN }),
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(dto.password, salt);

        const user = await this.usersRepository.create({
            email: dto.email,
            fullName: dto.fullName,
            phone: dto.phone,
            nationalId: dto.nationalId,
            passwordHash,
        });

        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = await this.jwtService.signAsync(payload);

        return {
            id: user.id,
            email: user.email,
            accessToken,
        };
    }
}