import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { usePanicMonitor } from '@/hooks/usePanicMonitor';

const invokeMock = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: invokeMock,
    },
  },
}));

describe('usePanicMonitor', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T10:00:00Z'));
    invokeMock.mockReset();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    invokeMock.mockReset();
    global.fetch = originalFetch;
  });

  it('reflects overlay metadata from system-health responses', async () => {
    invokeMock.mockResolvedValue({
      data: {
        status: 'warning',
        message: 'Maintenance planifiée',
        overlay: {
          active: true,
          severity: 'recovering',
          message: 'Maintenance en cours',
          details: 'Intervention planifiée sur l\'orchestrateur',
          retry_seconds: 45,
          last_triggered_at: '2025-01-01T09:58:00.000Z',
        },
        summary: {
          total_services: 5,
          healthy: 3,
          warnings: 1,
          errors: 1,
        },
        checks: [
          { service: 'api', status: 'warning' },
        ],
      },
      error: null,
    });

    const { result } = renderHook(() => usePanicMonitor({ pollIntervalMs: 120000, cooldownMs: 30000 }));

    await waitFor(() => {
      expect(result.current.state.visible).toBe(true);
      expect(result.current.state.overlayActive).toBe(true);
    });

    expect(result.current.state.severity).toBe('recovering');
    expect(result.current.state.message).toBe('Maintenance en cours');
    expect(result.current.state.details).toContain('Intervention planifiée');
    expect(result.current.state.summary?.total_services).toBe(5);
    expect(result.current.state.lastTriggeredAt).toBe('2025-01-01T09:58:00.000Z');
    expect(result.current.retryCountdown).toBeGreaterThan(0);
    expect(result.current.retryCountdown).toBeLessThanOrEqual(45);
  });

  it('falls back to offline messaging when both health checks fail', async () => {
    invokeMock.mockRejectedValue(new Error('network down'));
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => usePanicMonitor({ pollIntervalMs: 60000, cooldownMs: 15000 }));

    await waitFor(() => {
      expect(result.current.state.visible).toBe(true);
      expect(result.current.state.overlayActive).toBe(true);
    });

    expect(result.current.state.severity).toBe('critical');
    expect(result.current.state.message).toContain('Impossible de contacter');
    expect(result.current.state.details).toContain('Impossible de contacter');
  });
});
