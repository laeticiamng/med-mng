export function calculateMasteryLevel(
  correctAnswers: number,
  totalQuestions: number,
  reviewCount: number
): number {
  if (totalQuestions === 0) return 0;

  const accuracy = correctAnswers / totalQuestions;
  const practiceBonus = Math.min(reviewCount * 0.05, 0.2); // Max 20% bonus

  return Math.min(accuracy + practiceBonus, 1);
}

export function getNextReviewDate(
  masteryLevel: number,
  lastReviewed: Date
): Date {
  // Spaced repetition intervals based on mastery
  const daysUntilReview = Math.floor(
    masteryLevel < 0.3
      ? 1
      : masteryLevel < 0.5
        ? 3
        : masteryLevel < 0.7
          ? 7
          : masteryLevel < 0.9
            ? 14
            : 30
  );

  const nextDate = new Date(lastReviewed);
  nextDate.setDate(nextDate.getDate() + daysUntilReview);
  return nextDate;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
