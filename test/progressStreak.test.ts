import { calculateNextStreak } from '@/utils/progressStreak';

describe('calculateNextStreak', () => {
  it('starts streak when no last opened date', () => {
    const result = calculateNextStreak(null, 0, new Date('2024-01-10T12:00:00Z'));
    expect(result).toBe(1);
  });

  it('keeps streak for same day', () => {
    const result = calculateNextStreak(
      '2024-01-10T08:00:00Z',
      3,
      new Date('2024-01-10T18:00:00Z')
    );
    expect(result).toBe(3);
  });

  it('increments streak when last opened was yesterday', () => {
    const result = calculateNextStreak(
      '2024-01-09T08:00:00Z',
      3,
      new Date('2024-01-10T08:00:00Z')
    );
    expect(result).toBe(4);
  });

  it('resets streak when gap is more than one day', () => {
    const result = calculateNextStreak(
      '2024-01-07T08:00:00Z',
      5,
      new Date('2024-01-10T08:00:00Z')
    );
    expect(result).toBe(1);
  });
});
