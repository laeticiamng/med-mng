/**
 * 🎮 GAMIFICATION MODULE TESTS
 * Tests for XP, badges, streaks, challenges, and leaderboard
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ────────────────────────────────────────────
// 🏆 XP & LEVEL SYSTEM TESTS
// ────────────────────────────────────────────

describe('Gamification - XP & Levels', () => {
  const calculateLevel = (xp: number): number => {
    return Math.floor(xp / 100) + 1;
  };

  const xpForNextLevel = (currentXp: number): number => {
    const level = calculateLevel(currentXp);
    return level * 100 - currentXp;
  };

  it('should calculate level from XP correctly', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(99)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(250)).toBe(3);
    expect(calculateLevel(1000)).toBe(11);
  });

  it('should calculate XP needed for next level', () => {
    expect(xpForNextLevel(0)).toBe(100);
    expect(xpForNextLevel(50)).toBe(50);
    expect(xpForNextLevel(99)).toBe(1);
    expect(xpForNextLevel(100)).toBe(100);
  });

  it('should award XP for completed activities', () => {
    const xpRewards = {
      flashcard_review: 5,
      exam_completed: 25,
      song_generated: 15,
      daily_login: 10,
      streak_bonus: 20,
    };

    let totalXp = 0;
    totalXp += xpRewards.daily_login;
    totalXp += xpRewards.flashcard_review * 5;
    totalXp += xpRewards.exam_completed;

    expect(totalXp).toBe(60);
  });

  it('should apply streak multiplier correctly', () => {
    const getStreakMultiplier = (streak: number) => {
      if (streak >= 30) return 2.0;
      if (streak >= 14) return 1.5;
      if (streak >= 7) return 1.25;
      return 1.0;
    };

    expect(getStreakMultiplier(0)).toBe(1.0);
    expect(getStreakMultiplier(7)).toBe(1.25);
    expect(getStreakMultiplier(14)).toBe(1.5);
    expect(getStreakMultiplier(30)).toBe(2.0);
  });
});

// ────────────────────────────────────────────
// 🏅 BADGE SYSTEM TESTS
// ────────────────────────────────────────────

describe('Gamification - Badges', () => {
  interface Badge {
    id: string;
    name: string;
    condition: (stats: UserStats) => boolean;
  }

  interface UserStats {
    songsGenerated: number;
    flashcardsReviewed: number;
    examsCompleted: number;
    streakDays: number;
    totalXp: number;
  }

  const badges: Badge[] = [
    {
      id: 'first_song',
      name: 'Première Mélodie',
      condition: (stats) => stats.songsGenerated >= 1,
    },
    {
      id: 'song_master',
      name: 'Maître des Mélodies',
      condition: (stats) => stats.songsGenerated >= 50,
    },
    {
      id: 'streak_7',
      name: 'Semaine Parfaite',
      condition: (stats) => stats.streakDays >= 7,
    },
    {
      id: 'exam_ace',
      name: 'As des Examens',
      condition: (stats) => stats.examsCompleted >= 10,
    },
  ];

  const getUnlockedBadges = (stats: UserStats): Badge[] => {
    return badges.filter((badge) => badge.condition(stats));
  };

  it('should unlock badge for first song', () => {
    const stats: UserStats = {
      songsGenerated: 1,
      flashcardsReviewed: 0,
      examsCompleted: 0,
      streakDays: 0,
      totalXp: 0,
    };

    const unlocked = getUnlockedBadges(stats);
    expect(unlocked.some((b) => b.id === 'first_song')).toBe(true);
  });

  it('should unlock multiple badges', () => {
    const stats: UserStats = {
      songsGenerated: 50,
      flashcardsReviewed: 100,
      examsCompleted: 10,
      streakDays: 7,
      totalXp: 1000,
    };

    const unlocked = getUnlockedBadges(stats);
    expect(unlocked).toHaveLength(4);
  });

  it('should not unlock badges when conditions not met', () => {
    const stats: UserStats = {
      songsGenerated: 0,
      flashcardsReviewed: 0,
      examsCompleted: 0,
      streakDays: 0,
      totalXp: 0,
    };

    const unlocked = getUnlockedBadges(stats);
    expect(unlocked).toHaveLength(0);
  });
});

// ────────────────────────────────────────────
// 🔥 STREAK SYSTEM TESTS
// ────────────────────────────────────────────

describe('Gamification - Streaks', () => {
  const calculateStreak = (lastActivityDate: Date | null, today: Date): number => {
    if (!lastActivityDate) return 0;
    
    const diffDays = Math.floor(
      (today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return diffDays <= 1 ? 1 : 0;
  };

  it('should maintain streak for consecutive days', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    expect(calculateStreak(yesterday, new Date())).toBe(1);
  });

  it('should reset streak after missed day', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    expect(calculateStreak(twoDaysAgo, new Date())).toBe(0);
  });

  it('should handle null last activity', () => {
    expect(calculateStreak(null, new Date())).toBe(0);
  });

  it('should count same-day activity', () => {
    const today = new Date();
    expect(calculateStreak(today, today)).toBe(1);
  });
});

// ────────────────────────────────────────────
// 📊 LEADERBOARD TESTS
// ────────────────────────────────────────────

describe('Gamification - Leaderboard', () => {
  interface LeaderboardEntry {
    userId: string;
    displayName: string;
    xp: number;
    rank?: number;
  }

  const sortLeaderboard = (entries: LeaderboardEntry[]): LeaderboardEntry[] => {
    return [...entries]
      .sort((a, b) => b.xp - a.xp)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  };

  it('should sort users by XP descending', () => {
    const entries: LeaderboardEntry[] = [
      { userId: '1', displayName: 'User A', xp: 100 },
      { userId: '2', displayName: 'User B', xp: 500 },
      { userId: '3', displayName: 'User C', xp: 250 },
    ];

    const sorted = sortLeaderboard(entries);
    
    expect(sorted[0].displayName).toBe('User B');
    expect(sorted[1].displayName).toBe('User C');
    expect(sorted[2].displayName).toBe('User A');
  });

  it('should assign correct ranks', () => {
    const entries: LeaderboardEntry[] = [
      { userId: '1', displayName: 'User A', xp: 100 },
      { userId: '2', displayName: 'User B', xp: 500 },
    ];

    const sorted = sortLeaderboard(entries);
    
    expect(sorted[0].rank).toBe(1);
    expect(sorted[1].rank).toBe(2);
  });

  it('should handle empty leaderboard', () => {
    const sorted = sortLeaderboard([]);
    expect(sorted).toHaveLength(0);
  });

  it('should handle equal XP (tie)', () => {
    const entries: LeaderboardEntry[] = [
      { userId: '1', displayName: 'User A', xp: 100 },
      { userId: '2', displayName: 'User B', xp: 100 },
    ];

    const sorted = sortLeaderboard(entries);
    expect(sorted).toHaveLength(2);
  });
});

// ────────────────────────────────────────────
// 🎯 DAILY CHALLENGES TESTS
// ────────────────────────────────────────────

describe('Gamification - Daily Challenges', () => {
  interface Challenge {
    id: string;
    title: string;
    targetCount: number;
    currentCount: number;
    xpReward: number;
  }

  const isChallengeCompleted = (challenge: Challenge): boolean => {
    return challenge.currentCount >= challenge.targetCount;
  };

  const getChallengeProgress = (challenge: Challenge): number => {
    return Math.min(100, (challenge.currentCount / challenge.targetCount) * 100);
  };

  it('should detect completed challenges', () => {
    const challenge: Challenge = {
      id: '1',
      title: 'Review 10 flashcards',
      targetCount: 10,
      currentCount: 10,
      xpReward: 50,
    };

    expect(isChallengeCompleted(challenge)).toBe(true);
  });

  it('should calculate challenge progress', () => {
    const challenge: Challenge = {
      id: '1',
      title: 'Review 10 flashcards',
      targetCount: 10,
      currentCount: 5,
      xpReward: 50,
    };

    expect(getChallengeProgress(challenge)).toBe(50);
  });

  it('should cap progress at 100%', () => {
    const challenge: Challenge = {
      id: '1',
      title: 'Review 10 flashcards',
      targetCount: 10,
      currentCount: 15,
      xpReward: 50,
    };

    expect(getChallengeProgress(challenge)).toBe(100);
  });
});
