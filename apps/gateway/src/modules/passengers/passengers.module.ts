import { Module } from "@nestjs/common";
import { IdentityClientModule } from "../../clients/identity/identity-client.module";
import { AuthModule } from "../auth/auth.module";
import { PassengersController } from "./passengers.controller";

@Module({
  imports: [AuthModule, IdentityClientModule],
  controllers: [PassengersController],
})
export class PassengersModule {}
