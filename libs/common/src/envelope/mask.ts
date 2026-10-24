
const SECRET = /^(password|newPassword|oldPassword|code|otp|token|refreshToken|accessToken|pin|cvv|cardNumber|card)$/i;
const MAX = 60;

const last = (s: string, n: number) => '*'.repeat(Math.max(s.length - n, 0)) + s.slice(-n);

export function maskValue(field: string, value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const leaf = field.split('.').pop()!.replace(/\[\d+\]$/, '');
  if (SECRET.test(leaf)) return undefined;

  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (/^national.?id$/i.test(leaf) || /^phone/i.test(leaf)) return last(text, 4);
  if (/^email$/i.test(leaf)) {
    const [name, domain] = text.split('@');
    return domain ? `${name.slice(0, 1)}***@${domain}` : `${text.slice(0, 1)}***`;
  }
  return text.length > MAX ? `${text.slice(0, MAX)}…` : text;
}
