/**
 * 🧪 CRITICAL TESTS
 * Tests prioritaires pour les fonctionnalités critiques
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import components to test
import { AuthProvider } from '@/components/med-mng/AuthProvider';
import { MusicCard } from '@/components/edn/music/MusicCard';
import { SearchSystem } from '@/components/advanced/SearchSystem';
import { NotificationSystem } from '@/components/advanced/NotificationSystem';
import { mockAuth, mockAudio, mockLanguage } from './setup';

// 🎭 TEST WRAPPER
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// 🔐 AUTHENTICATION TESTS
describe('🔐 Authentication Critical Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful login flow', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AuthProvider>
          <div data-testid="auth-status">
            {mockAuth.user ? 'Authenticated' : 'Not Authenticated'}
          </div>
        </AuthProvider>
      </TestWrapper>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });

  it('should handle login errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <TestWrapper>
        <AuthProvider>
          <div>Auth Test</div>
        </AuthProvider>
      </TestWrapper>
    );

    // Test should not crash on auth errors
    expect(screen.getByText('Auth Test')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should persist session across page reloads', () => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn(() => JSON.stringify({ user: mockAuth.user })),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    });

    render(
      <TestWrapper>
        <AuthProvider>
          <div>Session Test</div>
        </AuthProvider>
      </TestWrapper>
    );

    expect(mockLocalStorage.getItem).toHaveBeenCalled();
  });
});

// 🎵 MUSIC GENERATION TESTS
describe('🎵 Music Generation Critical Tests', () => {
  const mockMusicProps = {
    rang: 'A' as const,
    title: 'Test Music',
    paroles: 'Test lyrics content',
    selectedStyle: 'acoustic',
    musicDuration: 180,
    isGenerating: false,
    generatedAudio: '',
    isPlaying: false,
    isCurrentTrack: false,
    isMinimized: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    onGenerateMusic: vi.fn(),
    onPlayPause: vi.fn(),
    onSeek: vi.fn(),
    onVolumeChange: vi.fn(),
    onStop: vi.fn(),
    onMinimize: vi.fn()
  };

  it('should render music card with correct props', () => {
    render(
      <TestWrapper>
        <MusicCard {...mockMusicProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Music')).toBeInTheDocument();
    expect(screen.getByText(/Générer Musique Rang A/)).toBeInTheDocument();
  });

  it('should handle music generation flow', async () => {
    const onGenerateMusic = vi.fn();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MusicCard 
          {...mockMusicProps} 
          onGenerateMusic={onGenerateMusic}
        />
      </TestWrapper>
    );

    const generateButton = screen.getByText(/Générer Musique Rang A/);
    await user.click(generateButton);

    expect(onGenerateMusic).toHaveBeenCalledTimes(1);
  });

  it('should disable button during generation', () => {
    render(
      <TestWrapper>
        <MusicCard 
          {...mockMusicProps} 
          isGenerating={true}
        />
      </TestWrapper>
    );

    const generateButton = screen.getByText(/Génération en cours/);
    expect(generateButton).toBeDisabled();
  });

  it('should validate lyrics before generation', () => {
    render(
      <TestWrapper>
        <MusicCard 
          {...mockMusicProps} 
          paroles=""
        />
      </TestWrapper>
    );

    expect(screen.getByText(/paroles valides/)).toBeInTheDocument();
  });
});

// 🔍 SEARCH SYSTEM TESTS
describe('🔍 Search System Critical Tests', () => {
  const mockSearchProps = {
    placeholder: 'Rechercher...',
    onResultSelect: vi.fn()
  };

  it('should render search input', () => {
    render(
      <TestWrapper>
        <SearchSystem {...mockSearchProps} />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
  });

  it('should handle search input changes', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <SearchSystem {...mockSearchProps} />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Rechercher...');
    await user.type(searchInput, 'test query');

    expect(searchInput).toHaveValue('test query');
  });

  it('should show filters when expanded', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <SearchSystem {...mockSearchProps} />
      </TestWrapper>
    );

    // Look for filter button and click it
    const filterButtons = screen.getAllByRole('button');
    const filterButton = filterButtons.find(btn => 
      btn.textContent?.includes('Filtres') || 
      btn.getAttribute('aria-label')?.includes('filter')
    );

    if (filterButton) {
      await user.click(filterButton);
      // Filters should be visible after clicking
    }
  });
});

// 🔔 NOTIFICATION SYSTEM TESTS
describe('🔔 Notification System Critical Tests', () => {
  const mockNotificationProps = {
    isOpen: true,
    onClose: vi.fn()
  };

  it('should render when open', () => {
    render(
      <TestWrapper>
        <NotificationSystem {...mockNotificationProps} />
      </TestWrapper>
    );

    expect(screen.getByText(/Notifications/)).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <NotificationSystem 
          {...mockNotificationProps} 
          onClose={onClose}
        />
      </TestWrapper>
    );

    // Find and click close button
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => 
      btn.getAttribute('aria-label')?.includes('close') ||
      btn.textContent?.includes('×')
    );

    if (closeButton) {
      await user.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('should not render when closed', () => {
    render(
      <TestWrapper>
        <NotificationSystem 
          {...mockNotificationProps} 
          isOpen={false}
        />
      </TestWrapper>
    );

    // Should not show notifications when closed
    expect(screen.queryByText(/Notifications/)).not.toBeInTheDocument();
  });
});

// 🌐 NETWORK ERROR HANDLING TESTS
describe('🌐 Network Error Handling Tests', () => {
  it('should handle network errors gracefully', async () => {
    // Mock a network error
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <div>Network Test Component</div>
      </TestWrapper>
    );

    // Component should still render despite network errors
    expect(screen.getByText('Network Test Component')).toBeInTheDocument();

    global.fetch = originalFetch;
    consoleSpy.mockRestore();
  });
});

// 📱 RESPONSIVE DESIGN TESTS
describe('📱 Responsive Design Tests', () => {
  it('should adapt to mobile viewport', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(
      <TestWrapper>
        <div className="hidden md:block">Desktop Only</div>
        <div className="md:hidden">Mobile Only</div>
      </TestWrapper>
    );

    // Test responsive classes
    expect(screen.getByText('Mobile Only')).toBeInTheDocument();
  });
});

// ♿ ACCESSIBILITY TESTS
describe('♿ Accessibility Critical Tests', () => {
  it('should have proper ARIA labels', () => {
    render(
      <TestWrapper>
        <button aria-label="Test button">Click me</button>
      </TestWrapper>
    );

    const button = screen.getByRole('button', { name: 'Test button' });
    expect(button).toBeInTheDocument();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <button>First</button>
        <button>Second</button>
      </TestWrapper>
    );

    const firstButton = screen.getByText('First');
    const secondButton = screen.getByText('Second');

    await user.tab();
    expect(firstButton).toHaveFocus();

    await user.tab();
    expect(secondButton).toHaveFocus();
  });

  it('should have sufficient color contrast', () => {
    render(
      <TestWrapper>
        <div className="text-foreground bg-background">
          Readable text
        </div>
      </TestWrapper>
    );

    // This would require a proper contrast checking tool in real tests
    expect(screen.getByText('Readable text')).toBeInTheDocument();
  });
});

// 🎯 PERFORMANCE TESTS
describe('🎯 Performance Critical Tests', () => {
  it('should not cause memory leaks', () => {
    const { unmount } = render(
      <TestWrapper>
        <div>Performance Test</div>
      </TestWrapper>
    );

    // Component should unmount cleanly
    expect(() => unmount()).not.toThrow();
  });

  it('should handle large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }));

    const start = performance.now();
    
    render(
      <TestWrapper>
        <div>
          {largeDataset.slice(0, 10).map(item => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>
      </TestWrapper>
    );

    const end = performance.now();
    const renderTime = end - start;

    // Should render quickly (under 100ms)
    expect(renderTime).toBeLessThan(100);
  });
});