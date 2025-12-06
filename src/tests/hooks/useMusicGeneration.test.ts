import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMusicGeneration } from '@/hooks/useMusicGeneration';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('@/hooks/useMusicLibrary', () => ({
  useMusicLibrary: () => ({
    loadLibrary: vi.fn()
  })
}));

describe('useMusicGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useMusicGeneration());
    
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationProgress).toBe('');
    expect(typeof result.current.generateMusic).toBe('function');
  });

  it('should handle successful music generation', async () => {
    const mockResponse = {
      id: 'test-id',
      suno_audio_id: 'suno-123',
      title: 'Test Song',
      meta: {
        itemCode: 'IC-1',
        rang: 'A' as const,
        structure: 'test',
        style: 'test'
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    const { result } = renderHook(() => useMusicGeneration());
    
    const generationResult = await result.current.generateMusic({
      itemCode: 'IC-1',
      rang: 'A',
      tableauData: {}
    });

    expect(generationResult).toEqual(expect.objectContaining({
      id: 'test-id',
      suno_audio_id: 'suno-123'
    }));
  });

  it('should handle generation errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useMusicGeneration());
    
    const generationResult = await result.current.generateMusic({
      itemCode: 'IC-1',
      rang: 'A'
    });

    expect(generationResult).toBeNull();
  });

  it('should update generation progress', async () => {
    const mockResponse = {
      id: 'test-id',
      suno_audio_id: 'suno-123'
    };

    (global.fetch as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => mockResponse
      }), 100))
    );

    const { result } = renderHook(() => useMusicGeneration());
    
    const promise = result.current.generateMusic({
      itemCode: 'IC-1',
      rang: 'A'
    });

    await waitFor(() => {
      expect(result.current.generationProgress).not.toBe('');
    });

    await promise;
    
    expect(result.current.isGenerating).toBe(false);
  });
});
