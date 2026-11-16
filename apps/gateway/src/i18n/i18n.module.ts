import { Global, Module } from "@nestjs/common";
import {
  AcceptLanguageResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from "nestjs-i18n";
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
      resolvers: [new QueryResolver(["lang"]), new AcceptLanguageResolver()],
      useICU: true,
    }),
  ],
  exports: [I18nModule],
})
export class GatewayI18nModule {}
