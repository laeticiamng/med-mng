import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSystemStatus } from '../../src/hooks/useSystemStatus';

var invokeMock: ReturnType<typeof vi.fn>;
const toastMock = vi.fn();

vi.mock('@/integrations/supabase/client', () => {
  invokeMock = vi.fn();
  return {
    supabase: {
      functions: {
        invoke: invokeMock,
      },
    },
  };
});

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

describe('useSystemStatus', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    toastMock.mockReset();
  });

  it('retrieves system status and data completeness', async () => {
    const statusData = {
      status: 'operational',
      version: '2.1.0',
      features: {},
      compatibility: {
        frontendMinVersion: '1.0.0',
        frontendShouldUpgrade: false,
        breaking_changes: [],
      },
    };
    const completenessData = {
      completeness_score: 90,
      gaps: [],
    };

    invokeMock
      .mockResolvedValueOnce({ data: statusData, error: null })
      .mockResolvedValueOnce({ data: completenessData, error: null });

    const { result } = renderHook(() => useSystemStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status).toEqual(statusData);
    expect(result.current.dataCompleteness).toEqual(completenessData);
    expect(invokeMock).toHaveBeenCalledWith(
      'med-mng-api/status',
      expect.objectContaining({ method: 'GET' })
    );
    expect(invokeMock).toHaveBeenCalledWith(
      'med-mng-api/status/data-completeness',
      expect.objectContaining({ method: 'GET' })
    );
    expect(toastMock).not.toHaveBeenCalled();
  });

  it('provides fallback data and shows toast on error', async () => {
    invokeMock.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSystemStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status).toEqual({
      status: 'operational',
      version: '1.0.0',
      features: {},
      compatibility: {
        frontendMinVersion: '1.0.0',
        frontendShouldUpgrade: false,
        breaking_changes: [],
      },
    });
    expect(result.current.dataCompleteness).toEqual({
      completeness_score: 75,
      gaps: [],
    });
    expect(toastMock).toHaveBeenCalled();
  });

  it('suppresses toast when silent mode enabled', async () => {
    invokeMock.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSystemStatus({ silent: true }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status?.status).toBe('operational');
    expect(toastMock).not.toHaveBeenCalled();
  });
});
