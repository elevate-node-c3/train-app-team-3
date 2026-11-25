export function normalizeSearchNumber(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    const zeroCode = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - zeroCode);
  });
}
