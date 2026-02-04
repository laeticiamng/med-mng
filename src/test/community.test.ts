/**
 * 👥 COMMUNITY MODULE TESTS
 * Tests for forum, events, mentorship, and social features
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ────────────────────────────────────────────
// 💬 FORUM TESTS
// ────────────────────────────────────────────

describe('Community - Forum', () => {
  interface ForumTopic {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: Date;
    replyCount: number;
    isPinned: boolean;
    isLocked: boolean;
    tags: string[];
  }

  interface ForumReply {
    id: string;
    topicId: string;
    content: string;
    authorId: string;
    createdAt: Date;
    likes: number;
  }

  const sortTopics = (
    topics: ForumTopic[],
    sortBy: 'recent' | 'popular' | 'pinned'
  ): ForumTopic[] => {
    const sorted = [...topics];
    
    switch (sortBy) {
      case 'recent':
        return sorted.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
      case 'popular':
        return sorted.sort((a, b) => b.replyCount - a.replyCount);
      case 'pinned':
        return sorted.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
      default:
        return sorted;
    }
  };

  const filterByTags = (
    topics: ForumTopic[],
    tags: string[]
  ): ForumTopic[] => {
    if (tags.length === 0) return topics;
    return topics.filter((t) => 
      tags.some((tag) => t.tags.includes(tag))
    );
  };

  it('should sort topics by most recent', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);

    const topics: ForumTopic[] = [
      {
        id: '1',
        title: 'Old Topic',
        content: '',
        authorId: 'u1',
        createdAt: yesterday,
        replyCount: 0,
        isPinned: false,
        isLocked: false,
        tags: [],
      },
      {
        id: '2',
        title: 'New Topic',
        content: '',
        authorId: 'u1',
        createdAt: now,
        replyCount: 0,
        isPinned: false,
        isLocked: false,
        tags: [],
      },
    ];

    const sorted = sortTopics(topics, 'recent');
    expect(sorted[0].id).toBe('2');
  });

  it('should sort topics by popularity (reply count)', () => {
    const topics: ForumTopic[] = [
      {
        id: '1',
        title: 'Unpopular',
        content: '',
        authorId: 'u1',
        createdAt: new Date(),
        replyCount: 5,
        isPinned: false,
        isLocked: false,
        tags: [],
      },
      {
        id: '2',
        title: 'Popular',
        content: '',
        authorId: 'u1',
        createdAt: new Date(),
        replyCount: 50,
        isPinned: false,
        isLocked: false,
        tags: [],
      },
    ];

    const sorted = sortTopics(topics, 'popular');
    expect(sorted[0].id).toBe('2');
    expect(sorted[0].replyCount).toBe(50);
  });

  it('should prioritize pinned topics', () => {
    const topics: ForumTopic[] = [
      {
        id: '1',
        title: 'Normal',
        content: '',
        authorId: 'u1',
        createdAt: new Date(),
        replyCount: 100,
        isPinned: false,
        isLocked: false,
        tags: [],
      },
      {
        id: '2',
        title: 'Pinned',
        content: '',
        authorId: 'u1',
        createdAt: new Date(),
        replyCount: 0,
        isPinned: true,
        isLocked: false,
        tags: [],
      },
    ];

    const sorted = sortTopics(topics, 'pinned');
    expect(sorted[0].id).toBe('2');
    expect(sorted[0].isPinned).toBe(true);
  });

  it('should filter topics by tags', () => {
    const topics: ForumTopic[] = [
      {
        id: '1',
        title: 'Cardio Question',
        content: '',
        authorId: 'u1',
        createdAt: new Date(),
        replyCount: 0,
        isPinned: false,
        isLocked: false,
        tags: ['cardiology'],
      },
      {
        id: '2',
        title: 'Neuro Question',
        content: '',
        authorId: 'u1',
        createdAt: new Date(),
        replyCount: 0,
        isPinned: false,
        isLocked: false,
        tags: ['neurology'],
      },
    ];

    const filtered = filterByTags(topics, ['cardiology']);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });
});

// ────────────────────────────────────────────
// 📅 EVENTS TESTS
// ────────────────────────────────────────────

describe('Community - Events', () => {
  interface CommunityEvent {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    maxParticipants: number;
    currentParticipants: number;
    isOnline: boolean;
  }

  const isEventFull = (event: CommunityEvent): boolean => {
    return event.currentParticipants >= event.maxParticipants;
  };

  const isEventUpcoming = (event: CommunityEvent): boolean => {
    return event.startDate.getTime() > Date.now();
  };

  const isEventOngoing = (event: CommunityEvent): boolean => {
    const now = Date.now();
    return event.startDate.getTime() <= now && event.endDate.getTime() >= now;
  };

  const canRegister = (event: CommunityEvent): boolean => {
    return !isEventFull(event) && isEventUpcoming(event);
  };

  it('should detect full events', () => {
    const fullEvent: CommunityEvent = {
      id: '1',
      title: 'Full Event',
      description: '',
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 90000000),
      maxParticipants: 10,
      currentParticipants: 10,
      isOnline: true,
    };

    expect(isEventFull(fullEvent)).toBe(true);
  });

  it('should detect upcoming events', () => {
    const tomorrow = new Date(Date.now() + 86400000);
    const dayAfter = new Date(Date.now() + 172800000);

    const upcomingEvent: CommunityEvent = {
      id: '1',
      title: 'Future Event',
      description: '',
      startDate: tomorrow,
      endDate: dayAfter,
      maxParticipants: 10,
      currentParticipants: 0,
      isOnline: true,
    };

    expect(isEventUpcoming(upcomingEvent)).toBe(true);
  });

  it('should determine registration eligibility', () => {
    const tomorrow = new Date(Date.now() + 86400000);
    const dayAfter = new Date(Date.now() + 172800000);

    const openEvent: CommunityEvent = {
      id: '1',
      title: 'Open Event',
      description: '',
      startDate: tomorrow,
      endDate: dayAfter,
      maxParticipants: 10,
      currentParticipants: 5,
      isOnline: true,
    };

    expect(canRegister(openEvent)).toBe(true);
  });

  it('should prevent registration for full events', () => {
    const tomorrow = new Date(Date.now() + 86400000);

    const fullEvent: CommunityEvent = {
      id: '1',
      title: 'Full Event',
      description: '',
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 3600000),
      maxParticipants: 10,
      currentParticipants: 10,
      isOnline: true,
    };

    expect(canRegister(fullEvent)).toBe(false);
  });
});

// ────────────────────────────────────────────
// 🧑‍🏫 MENTORSHIP TESTS
// ────────────────────────────────────────────

describe('Community - Mentorship', () => {
  interface MentorProfile {
    userId: string;
    name: string;
    specialties: string[];
    experienceYears: number;
    rating: number;
    maxMentees: number;
    currentMentees: number;
    isAvailable: boolean;
  }

  const findMatchingMentors = (
    mentors: MentorProfile[],
    specialty: string
  ): MentorProfile[] => {
    return mentors.filter(
      (m) => m.isAvailable && 
             m.specialties.includes(specialty) &&
             m.currentMentees < m.maxMentees
    );
  };

  const sortByRating = (mentors: MentorProfile[]): MentorProfile[] => {
    return [...mentors].sort((a, b) => b.rating - a.rating);
  };

  it('should find available mentors by specialty', () => {
    const mentors: MentorProfile[] = [
      {
        userId: '1',
        name: 'Dr. Cardio',
        specialties: ['cardiology'],
        experienceYears: 10,
        rating: 4.8,
        maxMentees: 5,
        currentMentees: 3,
        isAvailable: true,
      },
      {
        userId: '2',
        name: 'Dr. Neuro',
        specialties: ['neurology'],
        experienceYears: 8,
        rating: 4.5,
        maxMentees: 3,
        currentMentees: 3,
        isAvailable: true,
      },
    ];

    const cardioMentors = findMatchingMentors(mentors, 'cardiology');
    expect(cardioMentors).toHaveLength(1);
    expect(cardioMentors[0].name).toBe('Dr. Cardio');
  });

  it('should exclude full mentors', () => {
    const mentors: MentorProfile[] = [
      {
        userId: '1',
        name: 'Dr. Full',
        specialties: ['cardiology'],
        experienceYears: 10,
        rating: 5.0,
        maxMentees: 3,
        currentMentees: 3,
        isAvailable: true,
      },
    ];

    const available = findMatchingMentors(mentors, 'cardiology');
    expect(available).toHaveLength(0);
  });

  it('should sort mentors by rating', () => {
    const mentors: MentorProfile[] = [
      {
        userId: '1',
        name: 'Lower Rated',
        specialties: ['general'],
        experienceYears: 5,
        rating: 4.0,
        maxMentees: 5,
        currentMentees: 0,
        isAvailable: true,
      },
      {
        userId: '2',
        name: 'Higher Rated',
        specialties: ['general'],
        experienceYears: 10,
        rating: 4.9,
        maxMentees: 5,
        currentMentees: 0,
        isAvailable: true,
      },
    ];

    const sorted = sortByRating(mentors);
    expect(sorted[0].rating).toBe(4.9);
  });
});

// ────────────────────────────────────────────
// 📤 RESOURCE SHARING TESTS
// ────────────────────────────────────────────

describe('Community - Resource Sharing', () => {
  interface SharedResource {
    id: string;
    title: string;
    type: 'document' | 'link' | 'note' | 'deck';
    authorId: string;
    downloads: number;
    likes: number;
    isPublic: boolean;
    tags: string[];
  }

  const getPublicResources = (resources: SharedResource[]): SharedResource[] => {
    return resources.filter((r) => r.isPublic);
  };

  const sortByPopularity = (resources: SharedResource[]): SharedResource[] => {
    return [...resources].sort((a, b) => (b.downloads + b.likes) - (a.downloads + a.likes));
  };

  it('should filter public resources', () => {
    const resources: SharedResource[] = [
      { id: '1', title: 'Public Doc', type: 'document', authorId: 'u1', downloads: 10, likes: 5, isPublic: true, tags: [] },
      { id: '2', title: 'Private Doc', type: 'document', authorId: 'u1', downloads: 5, likes: 2, isPublic: false, tags: [] },
    ];

    const publicRes = getPublicResources(resources);
    expect(publicRes).toHaveLength(1);
    expect(publicRes[0].title).toBe('Public Doc');
  });

  it('should sort by popularity (downloads + likes)', () => {
    const resources: SharedResource[] = [
      { id: '1', title: 'Less Popular', type: 'document', authorId: 'u1', downloads: 5, likes: 5, isPublic: true, tags: [] },
      { id: '2', title: 'More Popular', type: 'document', authorId: 'u1', downloads: 50, likes: 20, isPublic: true, tags: [] },
    ];

    const sorted = sortByPopularity(resources);
    expect(sorted[0].title).toBe('More Popular');
    expect(sorted[0].downloads + sorted[0].likes).toBe(70);
  });
});
