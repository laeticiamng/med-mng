/**
 * 🌐 MSW SERVER MOCK
 * Configuration des mocks pour les tests d'intégration
 */

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { 
  UserProfile, 
  GeneratedSong, 
  EDNItem, 
  APIResponse,
  SubscriptionInfo 
} from '@/types/global';

// 🎭 MOCK DATA
const mockUser: UserProfile = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  preferences: {
    theme: 'light',
    language: 'fr',
    notifications: {
      email: true,
      push: false,
      progress: true,
      achievements: true,
      reminders: false,
      social: false
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium',
      screenReader: false,
      keyboardNavigation: true
    },
    audio: {
      masterVolume: 80,
      autoplay: false,
      quality: 'high',
      downloadFormat: 'mp3'
    }
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockSong: GeneratedSong = {
  id: 'song-123',
  title: 'Test Song - Rang A',
  status: 'completed',
  audioUrl: 'https://example.com/test-song.mp3',
  lyrics: ['Test lyrics line 1', 'Test lyrics line 2'],
  style: 'acoustic',
  duration: 180,
  createdAt: '2024-01-01T00:00:00Z'
};

const mockEDNItem: EDNItem = {
  id: 'edn-123',
  itemCode: 'IC-001',
  title: 'Test EDN Item',
  rang: 'A',
  content: {
    tableau: { title: 'Test Tableau', content: 'Test content' },
    paroles: ['Test paroles 1', 'Test paroles 2'],
    quiz: [{
      id: 'quiz-1',
      question: 'Test question?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'Test explanation',
      difficulty: 'medium',
      category: 'general'
    }]
  },
  competences: [{
    id: 'comp-1',
    title: 'Test Competence',
    description: 'Test competence description',
    keywords: ['test', 'competence'],
    level: 'intermediate',
    category: 'general'
  }],
  lastUpdated: '2024-01-01T00:00:00Z'
};

// 🎯 API HANDLERS
const handlers = [
  // 🔐 AUTH ENDPOINTS
  http.post('*/auth/signin', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockUser,
          session: { token: 'mock-token', expiresAt: '2024-12-31T23:59:59Z' }
        }
      });
    }
    
    return HttpResponse.json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Email ou mot de passe incorrect',
        timestamp: new Date().toISOString()
      }
    }, { status: 401 });
  }),

  http.post('*/auth/signup', async ({ request }) => {
    const body = await request.json() as { email: string; password: string; name?: string };
    
    return HttpResponse.json({
      success: true,
      data: {
        user: { ...mockUser, email: body.email, name: body.name || 'New User' }
      }
    });
  }),

  http.post('*/auth/signout', () => {
    return HttpResponse.json({ success: true });
  }),

  // 👤 USER ENDPOINTS
  http.get('*/users/profile', () => {
    return HttpResponse.json<APIResponse<UserProfile>>({
      success: true,
      data: mockUser
    });
  }),

  http.patch('*/users/profile', async ({ request }) => {
    const updates = await request.json() as Partial<UserProfile>;
    
    return HttpResponse.json<APIResponse<UserProfile>>({
      success: true,
      data: { ...mockUser, ...updates, updatedAt: new Date().toISOString() }
    });
  }),

  // 🎵 MUSIC ENDPOINTS
  http.post('*/music/generate', async ({ request }) => {
    const body = await request.json() as { 
      lyrics: string[]; 
      style: string; 
      duration: number; 
    };
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return HttpResponse.json<APIResponse<GeneratedSong>>({
      success: true,
      data: {
        ...mockSong,
        title: `Generated Song - ${body.style}`,
        style: body.style,
        duration: body.duration,
        lyrics: body.lyrics
      }
    });
  }),

  http.get('*/music/:id', ({ params }) => {
    return HttpResponse.json<APIResponse<GeneratedSong>>({
      success: true,
      data: { ...mockSong, id: params.id as string }
    });
  }),

  http.get('*/music/:id/status', ({ params }) => {
    return HttpResponse.json<APIResponse<{ status: string; progress: number }>>({
      success: true,
      data: { status: 'completed', progress: 100 }
    });
  }),

  // 📚 EDN ENDPOINTS
  http.get('*/edn/items', ({ request }) => {
    const url = new URL(request.url);
    const rang = url.searchParams.get('rang');
    
    const items = rang ? [{ ...mockEDNItem, rang: rang as 'A' | 'B' }] : [mockEDNItem];
    
    return HttpResponse.json<APIResponse<EDNItem[]>>({
      success: true,
      data: items
    });
  }),

  http.get('*/edn/items/:itemCode', ({ params }) => {
    return HttpResponse.json<APIResponse<EDNItem>>({
      success: true,
      data: { ...mockEDNItem, itemCode: params.itemCode as string }
    });
  }),

  // 💳 SUBSCRIPTION ENDPOINTS
  http.get('*/subscriptions/current', () => {
    const subscription: SubscriptionInfo = {
      id: 'sub-123',
      plan: 'standard',
      status: 'active',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      quota: {
        monthlyMusic: 50,
        monthlyQCM: 200,
        monthlyChat: 500,
        storageGB: 10,
        concurrentGenerations: 3
      },
      usage: {
        monthlyMusicUsed: 15,
        monthlyQCMUsed: 45,
        monthlyChatUsed: 120,
        storageUsedGB: 2.5
      }
    };
    
    return HttpResponse.json<APIResponse<SubscriptionInfo>>({
      success: true,
      data: subscription
    });
  }),

  // 📊 ANALYTICS ENDPOINTS
  http.get('*/analytics/user', () => {
    return HttpResponse.json<APIResponse>({
      success: true,
      data: {
        totalSessions: 42,
        totalTime: 3600,
        averageSession: 86,
        completionRate: 78,
        favoriteTopics: ['cardiologie', 'neurologie'],
        weeklyProgress: [65, 70, 75, 80, 78, 82, 85]
      }
    });
  }),

  // 🔍 SEARCH ENDPOINTS
  http.get('*/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    
    return HttpResponse.json({
      success: true,
      data: {
        items: query ? [mockEDNItem] : [],
        total: query ? 1 : 0,
        facets: {
          categories: [{ value: 'general', count: 1, selected: false }],
          tags: [{ value: 'test', count: 1, selected: false }],
          ranges: [{ value: 'A', count: 1, selected: false }]
        },
        pagination: {
          page: 1,
          pageSize: 20,
          total: query ? 1 : 0,
          totalPages: query ? 1 : 0
        }
      }
    });
  }),

  // ❌ ERROR SIMULATION
  http.get('*/test/error', () => {
    return HttpResponse.json({
      success: false,
      error: {
        code: 'TEST_ERROR',
        message: 'This is a test error',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }),

  // 🌐 FALLBACK - Catch unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`🚨 Unhandled request: ${request.method} ${request.url}`);
    
    return HttpResponse.json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: `Mock not implemented for ${request.method} ${request.url}`,
        timestamp: new Date().toISOString()
      }
    }, { status: 501 });
  })
];

// 🌐 CREATE SERVER
export const server = setupServer(...handlers);

// 🎯 EXPORT MOCK DATA FOR TESTS
export const mockData = {
  user: mockUser,
  song: mockSong,
  ednItem: mockEDNItem
};

export default server;