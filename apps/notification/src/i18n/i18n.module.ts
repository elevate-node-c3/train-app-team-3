import { Global, Module } from "@nestjs/common";
import { GrpcMetadataResolver, I18nJsonLoader, I18nModule } from "nestjs-i18n";
import { existsSync } from "fs";
import { join } from "path";

const translationsPath = existsSync(join(__dirname, "ar"))
  ? __dirname
  : join(__dirname, "i18n");

@Global()
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: "ar",
      loader: I18nJsonLoader,
      loaderOptions: {
        path: translationsPath,
        includeSubfolders: true,
      },
      resolvers: [new GrpcMetadataResolver(["accept-language", "lang"])],
      disableMiddleware: true,
      useICU: true,
    }),
  ],
  exports: [I18nModule],
})
export class NotificationI18nModule {}
