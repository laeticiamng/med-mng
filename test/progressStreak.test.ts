import { calculateNextStreak } from '@/utils/progressStreak';

// Instants construits en heure LOCALE : calculateNextStreak compare des jours locaux (date-fns),
// et « 08:00Z / 18:00Z » ne sont pas le même jour à Auckland (UTC+13 en janvier).
const local = (j: number, h: number) => new Date(2024, 0, j, h).toISOString();

describe('calculateNextStreak', () => {
  it('starts streak when no last opened date', () => {
    const result = calculateNextStreak(null, 0, new Date('2024-01-10T12:00:00Z'));
    expect(result).toBe(1);
  });

  it('keeps streak for same day', () => {
    const result = calculateNextStreak(
      local(10, 8),
      3,
      new Date(local(10, 18))
    );
    expect(result).toBe(3);
  });

  it('increments streak when last opened was yesterday', () => {
    const result = calculateNextStreak(
      local(9, 8),
      3,
      new Date(local(10, 8))
    );
    expect(result).toBe(4);
  });

  it('resets streak when gap is more than one day', () => {
    const result = calculateNextStreak(
      local(7, 8),
      5,
      new Date(local(10, 8))
    );
    expect(result).toBe(1);
  });
});
