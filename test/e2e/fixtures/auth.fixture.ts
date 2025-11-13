export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {
    name: 'Test User',
    avatar_url: null
  }
};

export const mockSession = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  refresh_token: 'mock-refresh-token',
  user: mockUser
};

export const mockTeam = {
  id: 'team-1',
  name: 'Équipe Test',
  created_at: '2024-01-01T00:00:00Z',
  members: [
    { id: 'user-1', role: 'admin' },
    { id: 'user-2', role: 'member' },
    { id: 'user-3', role: 'member' }
  ]
};
