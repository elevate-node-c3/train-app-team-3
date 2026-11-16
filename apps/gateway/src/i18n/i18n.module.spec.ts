import { Test } from "@nestjs/testing";
import { I18nService } from "nestjs-i18n";
import { GatewayI18nModule } from "./i18n.module";

interface GatewayTranslations {
  auth: {
    noSession: string;
    internalServerError: string;
  };
  validation: {
    invalidEmail: string;
  };
}

describe("GatewayI18nModule", () => {
  it("loads auth and validation messages in Arabic and English", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GatewayI18nModule],
    }).compile();
    const i18n = moduleRef.get<I18nService<GatewayTranslations>>(I18nService);

    expect(i18n.translate("auth.noSession", { lang: "en" })).toBe(
      "The access token does not include a session",
    );
    expect(i18n.translate("auth.noSession", { lang: "ar" })).toBe(
      "رمز الوصول لا يحتوي على جلسة",
    );
    expect(i18n.translate("validation.invalidEmail", { lang: "ar" })).toBe(
      "يرجى إدخال بريد إلكتروني صالح",
    );

    await moduleRef.close();
  });
});
