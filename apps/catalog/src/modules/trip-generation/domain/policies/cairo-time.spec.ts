import { cairoIsoAt } from './cairo-time';

describe('cairoIsoAt', () => {
  it('preserves Cairo wall time and the correct offset across the daylight-saving transition', () => {
    expect(cairoIsoAt(Date.parse('2025-10-30T20:30:00.000Z'))).toBe(
      '2025-10-30T23:30:00+03:00',
    );
    expect(cairoIsoAt(Date.parse('2025-10-30T21:30:00.000Z'))).toBe(
      '2025-10-30T23:30:00+02:00',
    );
  });
});
