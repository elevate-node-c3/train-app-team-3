import { Metadata } from "@grpc/grpc-js";

export type AuthLanguage = "en" | "ar";

export function getAuthLanguage(metadata?: Metadata): AuthLanguage {
  const metadataValue =
    metadata?.get("accept-language")[0] ?? metadata?.get("lang")[0];
  const language = Buffer.isBuffer(metadataValue)
    ? metadataValue.toString("utf8")
    : metadataValue;
  const primaryLanguage = language
    ?.split(",")[0]
    ?.split(";")[0]
    ?.trim()
    .toLowerCase()
    .split("-")[0];

  return primaryLanguage === "en" ? "en" : "ar";
}
