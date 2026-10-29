import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { IdentityClientModule } from '../../clients/identity-client.module';

@Module({
  imports: [IdentityClientModule],
  controllers: [AuthController],
})
export class AuthModule {}
