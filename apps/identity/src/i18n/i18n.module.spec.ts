import { Test } from "@nestjs/testing";
import { I18nService } from "nestjs-i18n";
import { IdentityI18nModule } from "./i18n.module";

interface IdentityTranslations {
  auth: {
    emailAlreadyExists: string;
    invalidCredentials: string;
    sessionNotActive: string;
    otpInvalidOrExpired: string;
  };
  validation: Record<string, string>;
  formatting: {
    date: string;
    number: string;
    currency: string;
  };
}

describe("IdentityI18nModule", () => {
  it("loads auth translations from the locale folders", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [IdentityI18nModule],
    }).compile();

    const i18n = moduleRef.get<I18nService<IdentityTranslations>>(I18nService);
    expect(
      i18n.translate("auth.emailAlreadyExists", { lang: "en" }),
    ).toBe("Email already exists");
    expect(
      i18n.translate("auth.emailAlreadyExists", { lang: "ar" }),
    ).toBe("هذا البريد الإلكتروني مسجل بالفعل");
    expect(
      i18n.translate("validation.invalidEmail", { lang: "en" }),
    ).toBe("Please provide a valid email address");
    expect(i18n.translate("formatting.currency", { lang: "en" })).toBe(
      "{value, number, ::currency/EGP}",
    );
    await moduleRef.close();
  });
});
