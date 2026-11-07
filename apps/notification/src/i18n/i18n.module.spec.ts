import { Test } from "@nestjs/testing";
import { I18nService } from "nestjs-i18n";
import { NotificationI18nModule } from "./i18n.module";

describe("NotificationI18nModule", () => {
  it("loads both notification service locales", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [NotificationI18nModule],
    }).compile();
    const i18n = moduleRef.get<I18nService<Record<string, string>>>(I18nService);

    expect(i18n.getSupportedLanguages().sort()).toEqual(["ar", "en"]);

    await moduleRef.close();
  });
});
