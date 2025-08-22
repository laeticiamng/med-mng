/**
 * Tests unitaires pour la suppression des voix
 * Couvre les chemins d'erreur et les scénarios de validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { removeVocals } from '@/utils/vocal-remove';

// Mock du secureApiClient
vi.mock('@/lib/secureApiClient', () => ({
  secureSunoClient: {
    generateMusic: vi.fn()
  }
}));

import { secureSunoClient } from '@/lib/secureApiClient';

describe('removeVocals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error when audioId is empty', async () => {
    await expect(removeVocals('')).rejects.toThrow(
      'AudioId is required for vocal removal'
    );
  });

  it('should throw error when audioId is null/undefined', async () => {
    await expect(removeVocals(null as any)).rejects.toThrow(
      'AudioId is required for vocal removal'
    );
    
    await expect(removeVocals(undefined as any)).rejects.toThrow(
      'AudioId is required for vocal removal'
    );
  });

  it('should return instrumental URL when API call succeeds', async () => {
    const mockAudioId = 'test-audio-456';
    const mockInstrumentalUrl = 'https://example.com/instrumental.mp3';
    
    (secureSunoClient.generateMusic as any).mockResolvedValue({
      instrumental_url: mockInstrumentalUrl
    });

    const result = await removeVocals(mockAudioId);
    
    expect(result).toBe(mockInstrumentalUrl);
    expect(secureSunoClient.generateMusic).toHaveBeenCalledWith({
      action: 'remove_vocals',
      audioId: mockAudioId,
      output_format: 'mp3'
    });
  });

  it('should throw documented error when endpoint returns 404', async () => {
    const mockAudioId = 'test-audio-456';
    
    (secureSunoClient.generateMusic as any).mockRejectedValue(
      new Error('Suno API Error: invalid action')
    );

    await expect(removeVocals(mockAudioId)).rejects.toThrow(
      'Vocal removal endpoint not yet available in Suno API'
    );
    
    await expect(removeVocals(mockAudioId)).rejects.toThrow(
      `AudioId: ${mockAudioId}`
    );
    
    await expect(removeVocals(mockAudioId)).rejects.toThrow(
      'This feature requires AI vocal separation technology'
    );
  });

  it('should throw documented error when endpoint returns "Not Found"', async () => {
    const mockAudioId = 'test-audio-456';
    
    (secureSunoClient.generateMusic as any).mockRejectedValue(
      new Error('Suno API Error: not implemented')
    );

    await expect(removeVocals(mockAudioId)).rejects.toThrow(
      'Vocal removal endpoint not yet available in Suno API'
    );
  });

  it('should throw error when API returns success but no instrumental URL', async () => {
    const mockAudioId = 'test-audio-456';
    
    (secureSunoClient.generateMusic as any).mockResolvedValue({
      status: 'processing' // Pas d'instrumental_url
    });

    await expect(removeVocals(mockAudioId)).rejects.toThrow(
      'Vocal removal failed: No instrumental URL returned from API'
    );
  });

  it('should propagate other API errors with context', async () => {
    const mockAudioId = 'test-audio-456';
    const mockError = new Error('Insufficient credits');
    
    (secureSunoClient.generateMusic as any).mockRejectedValue(mockError);

    await expect(removeVocals(mockAudioId)).rejects.toThrow(
      `Failed to remove vocals from audio ${mockAudioId}: Insufficient credits`
    );
  });

  it('should handle unknown error types', async () => {
    const mockAudioId = 'test-audio-456';
    
    (secureSunoClient.generateMusic as any).mockRejectedValue('String error');

    await expect(removeVocals(mockAudioId)).rejects.toThrow(
      `Failed to remove vocals from audio ${mockAudioId}: Unknown error`
    );
  });

  it('should handle null response data', async () => {
    const mockAudioId = 'test-audio-456';
    
    (secureSunoClient.generateMusic as any).mockResolvedValue(null);

    await expect(removeVocals(mockAudioId)).rejects.toThrow(
      'Vocal removal failed: No instrumental URL returned from API'
    );
  });
});