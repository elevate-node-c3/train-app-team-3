export function normalizeNationalId(nationalId: string): string {
  return nationalId.replace(/[\u0660-\u0669\u06f0-\u06f9]/g, (digit) =>
    String.fromCharCode(
      digit.charCodeAt(0) >= 0x06f0
        ? digit.charCodeAt(0) - 0x06f0 + 48
        : digit.charCodeAt(0) - 0x0660 + 48,
    ),
  );
}

export function nationalIdVariants(nationalId: string): string[] {
  const ascii = normalizeNationalId(nationalId);
  const arabicIndic = ascii.replace(/[0-9]/g, (digit) =>
    String.fromCharCode(digit.charCodeAt(0) - 48 + 0x0660),
  );
  const easternArabic = ascii.replace(/[0-9]/g, (digit) =>
    String.fromCharCode(digit.charCodeAt(0) - 48 + 0x06f0),
  );
  return [...new Set([nationalId, ascii, arabicIndic, easternArabic])];
}
