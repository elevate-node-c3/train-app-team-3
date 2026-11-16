import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NotificationI18nModule } from "./i18n/i18n.module";
import { MailerModule } from "./modules/mailer/mailer.module";
import { VerificationCodeIssuedConsumer } from "./modules/mailer/verification-code-issued.consumer";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NotificationI18nModule,
    MailerModule,
  ],
  controllers: [VerificationCodeIssuedConsumer],
})
export class AppModule {}