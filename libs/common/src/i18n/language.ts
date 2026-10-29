import { DEFAULT_LANGUAGE, Language, SUPPORTED_LANGUAGES } from '../errors';

const MAX_HEADER_LENGTH = 200;

export function resolveLanguage(header: string | string[] | undefined | null): Language {
  const raw = Array.isArray(header) ? header.join(',') : header;
  if (!raw || raw.length > MAX_HEADER_LENGTH) return DEFAULT_LANGUAGE;

  let best: { lang: Language; q: number } | undefined;
  for (const part of raw.split(',')) {
    const [tag, ...params] = part.trim().split(';');
    const primary = tag.trim().toLowerCase().split('-')[0];
    const lang = SUPPORTED_LANGUAGES.find((l) => l === primary);
    if (!lang) continue;

    let q = 1;
    for (const p of params) {
      const m = /^\s*q\s*=\s*(.+)$/i.exec(p);
      if (m) q = Number(m[1]);
    }
    if (Number.isNaN(q) || q <= 0) continue;
    q = Math.min(q, 1);

    if (!best || q > best.q) best = { lang, q };
  }
  return best ? best.lang : DEFAULT_LANGUAGE;
}

export const contentLanguage = (lang: Language): string => lang;
