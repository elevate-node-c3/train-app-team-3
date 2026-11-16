import { Metadata } from "@grpc/grpc-js";
import { getAuthLanguage } from "./grpc-language";

describe("auth messages", () => {
  it("uses the language from gRPC Accept-Language metadata", () => {
    const metadata = new Metadata();
    metadata.set("accept-language", "ar-EG, en;q=0.8");

    expect(getAuthLanguage(metadata)).toBe("ar");
  });

  it("defaults to Arabic when the locale is missing or unsupported", () => {
    const metadata = new Metadata();
    metadata.set("accept-language", "fr-FR");

    expect(getAuthLanguage(metadata)).toBe("ar");
    expect(getAuthLanguage()).toBe("ar");
  });
});
