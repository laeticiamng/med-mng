import { differenceInCalendarDays, isSameDay } from 'date-fns';

export const calculateNextStreak = (
  lastOpenedAt: string | null,
  currentStreak: number | null,
  now: Date = new Date()
): number => {
  if (!lastOpenedAt) {
    return 1;
  }

  const lastDate = new Date(lastOpenedAt);
  const streakValue = currentStreak ?? 0;

  if (isSameDay(lastDate, now)) {
    return streakValue;
  }

  if (differenceInCalendarDays(now, lastDate) === 1) {
    return streakValue + 1;
  }

  return 1;
};
