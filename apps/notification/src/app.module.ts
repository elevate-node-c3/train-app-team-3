import { Module } from "@nestjs/common";
import { NotificationI18nModule } from "./i18n/i18n.module";

@Module({
  imports: [NotificationI18nModule],
})
export class AppModule {}