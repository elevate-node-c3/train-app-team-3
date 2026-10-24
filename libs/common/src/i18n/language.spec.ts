import { resolveLanguage, contentLanguage } from './language';

describe('resolveLanguage', () => {
  it.each([
    ['ar', 'ar'],
    ['en', 'en'],
    ['ar-EG', 'ar'],
    ['en-GB', 'en'],
    ['en-US,en;q=0.9', 'en'],
    ['EN-us', 'en'],
    ['fr, en;q=0.8', 'en'],
    ['en;q=0.5, ar;q=0.9', 'ar'],
    ['en, ar', 'en'],
    ['ar;q=0, en;q=0.1', 'en'],
  ])('%s -> %s', (header, expected) => expect(resolveLanguage(header)).toBe(expected));

  it.each([
    [undefined], [null], [''], ['   '], ['*'], ['fr'], ['fr-CA, de;q=0.8'], ['en;q=abc'], [';;;'], ['English'],
  ])('falls back to Arabic for %p', (header) => expect(resolveLanguage(header as any)).toBe('ar'));

  it('accepts a header that arrives as an array', () => expect(resolveLanguage(['en-GB', 'ar'])).toBe('en'));
  it('ignores a huge header', () => expect(resolveLanguage('en,'.repeat(500))).toBe('ar'));
  it('clamps q above 1', () => expect(resolveLanguage('en;q=5, ar;q=1')).toBe('en'));
  it('never throws', () => expect(() => resolveLanguage('\u0000;=,,q=')).not.toThrow());
  it('Content-Language is the plain code', () => expect(contentLanguage('en')).toBe('en'));
});
