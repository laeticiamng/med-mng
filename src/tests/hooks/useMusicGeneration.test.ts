import { useMusicGeneration } from '@/hooks/useMusicGeneration';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useMusicGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useMusicGeneration());
    
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationProgress).toBeDefined();
  });

  it('should have generateMusic function', () => {
    const { result } = renderHook(() => useMusicGeneration());
    expect(typeof result.current.generateMusic).toBe('function');
  });

  it('should track generation state types', () => {
    const { result } = renderHook(() => useMusicGeneration());
    
    expect(typeof result.current.isGenerating).toBe('boolean');
    expect(typeof result.current.generateMusic).toBe('function');
  });

  it('should handle generation request structure', () => {
    const { result } = renderHook(() => useMusicGeneration());
    
    // Test that the hook exposes expected interface
    const { generateMusic, isGenerating, generationProgress } = result.current;
    
    expect(generateMusic).toBeDefined();
    expect(isGenerating).toBe(false);
    expect(generationProgress).toBeDefined();
  });
});
