import { Module } from '@nestjs/common';
import { IdentityClientModule } from '../../clients/identity-client.module';
import { AuthController } from './auth.controller';

@Module({
    imports: [IdentityClientModule],
    controllers: [AuthController],
})
export class AuthModule { }