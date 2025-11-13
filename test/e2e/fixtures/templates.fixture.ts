export const mockTemplates = [
  {
    id: 'template-1',
    name: 'Template Test 1',
    description: 'Template de test pour les filtres',
    filters: {
      status: 'active',
      category: 'medical',
      priority: 'high'
    },
    tags: ['urgent', 'medecin', 'consultation'],
    sharing_type: 'private',
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_id: 'user-1'
  },
  {
    id: 'template-2',
    name: 'Template Partagé',
    description: 'Template partagé avec équipe',
    filters: {
      status: 'pending',
      department: 'cardiology'
    },
    tags: ['equipe', 'cardiologie'],
    sharing_type: 'team',
    is_default: false,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    user_id: 'user-1'
  },
  {
    id: 'template-3',
    name: 'Template Global',
    description: 'Template accessible à tous',
    filters: {
      status: 'completed'
    },
    tags: ['public', 'general'],
    sharing_type: 'global',
    is_default: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    user_id: 'user-1'
  }
];

export const mockTags = [
  { tag: 'urgent', count: 15 },
  { tag: 'medecin', count: 12 },
  { tag: 'consultation', count: 10 },
  { tag: 'equipe', count: 8 },
  { tag: 'cardiologie', count: 7 },
  { tag: 'public', count: 5 },
  { tag: 'general', count: 4 },
  { tag: 'admin', count: 3 }
];

export const mockComments = [
  {
    id: 'comment-1',
    template_id: 'template-1',
    user_id: 'user-1',
    comment: 'Excellent template, très utile',
    rating: 5,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'comment-2',
    template_id: 'template-1',
    user_id: 'user-2',
    comment: 'Bon template mais pourrait être amélioré',
    rating: 4,
    created_at: '2024-01-11T00:00:00Z',
    updated_at: '2024-01-11T00:00:00Z'
  }
];

export const mockFavorites = [
  {
    id: 'favorite-1',
    template_id: 'template-1',
    user_id: 'user-1',
    created_at: '2024-01-05T00:00:00Z'
  }
];

export const mockHistory = [
  {
    id: 'history-1',
    template_id: 'template-1',
    user_id: 'user-1',
    applied_at: '2024-01-15T10:30:00Z',
    result_count: 25
  },
  {
    id: 'history-2',
    template_id: 'template-2',
    user_id: 'user-1',
    applied_at: '2024-01-15T11:00:00Z',
    result_count: 12
  }
];

export const mockAnalytics = {
  total_templates: 150,
  active_templates: 120,
  shared_templates: 45,
  total_applications: 2500,
  unique_users: 85,
  popular_tags: mockTags.slice(0, 5),
  recent_activity: [
    {
      date: '2024-01-15',
      applications: 45,
      templates_created: 5
    },
    {
      date: '2024-01-14',
      applications: 38,
      templates_created: 3
    }
  ]
};
