import { Page } from '@playwright/test';
import { mockTemplates, mockTags, mockComments, mockFavorites, mockHistory, mockAnalytics } from '../fixtures/templates.fixture';
import { mockUser, mockSession } from '../fixtures/auth.fixture';

export async function mockSupabaseAPI(page: Page) {
  // Mock authentication
  await page.route('**/auth/v1/token**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSession)
    });
  });

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser)
    });
  });

  // Mock templates endpoints
  await page.route('**/rest/v1/filter_templates**', async (route) => {
    const method = route.request().method();
    const url = new URL(route.request().url());
    
    if (method === 'GET') {
      // Filtrer selon les query params
      let filteredTemplates = [...mockTemplates];
      
      const sharingType = url.searchParams.get('sharing_type');
      if (sharingType) {
        filteredTemplates = filteredTemplates.filter(t => t.sharing_type === sharingType);
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(filteredTemplates)
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON();
      const newTemplate = {
        id: `template-${Date.now()}`,
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newTemplate)
      });
    }
  });

  // Mock single template
  await page.route('**/rest/v1/filter_templates?id=eq.**', async (route) => {
    const method = route.request().method();
    
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockTemplates[0]])
      });
    } else if (method === 'PATCH') {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockTemplates[0], ...body })
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 204,
        contentType: 'application/json'
      });
    }
  });

  // Mock tags
  await page.route('**/rest/v1/rpc/get_popular_tags**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockTags)
    });
  });

  await page.route('**/rest/v1/rpc/search_tags**', async (route) => {
    const body = route.request().postDataJSON();
    const searchTerm = body.search_term?.toLowerCase() || '';
    const filtered = mockTags.filter(tag => 
      tag.tag.toLowerCase().includes(searchTerm)
    ).slice(0, 10);
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(filtered)
    });
  });

  // Mock comments
  await page.route('**/rest/v1/template_comments**', async (route) => {
    const method = route.request().method();
    
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockComments)
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON();
      const newComment = {
        id: `comment-${Date.now()}`,
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newComment)
      });
    }
  });

  // Mock favorites
  await page.route('**/rest/v1/template_favorites**', async (route) => {
    const method = route.request().method();
    
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockFavorites)
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON();
      const newFavorite = {
        id: `favorite-${Date.now()}`,
        ...body,
        created_at: new Date().toISOString()
      };
      
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newFavorite)
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 204,
        contentType: 'application/json'
      });
    }
  });

  // Mock history
  await page.route('**/rest/v1/template_history**', async (route) => {
    const method = route.request().method();
    
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockHistory)
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON();
      const newHistory = {
        id: `history-${Date.now()}`,
        ...body,
        applied_at: new Date().toISOString()
      };
      
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newHistory)
      });
    }
  });

  // Mock analytics
  await page.route('**/rest/v1/rpc/get_template_analytics**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockAnalytics)
    });
  });
}

export async function clearSupabaseMocks(page: Page) {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
}
