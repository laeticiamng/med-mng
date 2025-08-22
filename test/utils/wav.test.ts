/**
 * Tests unitaires pour la conversion WAV
 * Couvre les chemins d'erreur et les scénarios de validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertToWav } from '@/utils/wav';

// Mock du secureApiClient
vi.mock('@/lib/secureApiClient', () => ({
  secureSunoClient: {
    generateMusic: vi.fn()
  }
}));

import { secureSunoClient } from '@/lib/secureApiClient';

describe('convertToWav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error when audioId is empty', async () => {
    await expect(convertToWav('')).rejects.toThrow(
      'AudioId is required for WAV conversion'
    );
  });

  it('should throw error when audioId is null/undefined', async () => {
    await expect(convertToWav(null as any)).rejects.toThrow(
      'AudioId is required for WAV conversion'
    );
    
    await expect(convertToWav(undefined as any)).rejects.toThrow(
      'AudioId is required for WAV conversion'
    );
  });

  it('should return WAV URL when API call succeeds', async () => {
    const mockAudioId = 'test-audio-123';
    const mockWavUrl = 'https://example.com/audio.wav';
    
    (secureSunoClient.generateMusic as any).mockResolvedValue({
      wav_url: mockWavUrl
    });

    const result = await convertToWav(mockAudioId);
    
    expect(result).toBe(mockWavUrl);
    expect(secureSunoClient.generateMusic).toHaveBeenCalledWith({
      action: 'convert_to_wav',
      audioId: mockAudioId
    );
  });

  it('should throw documented error when endpoint returns 404', async () => {
    const mockAudioId = 'test-audio-123';
    
    (secureSunoClient.generateMusic as any).mockRejectedValue(
      new Error('Suno API Error: invalid action')
    );

    await expect(convertToWav(mockAudioId)).rejects.toThrow(
      'WAV conversion endpoint not yet available in Suno API'
    );
    
    await expect(convertToWav(mockAudioId)).rejects.toThrow(
      `AudioId: ${mockAudioId}`
    );
  });

  it('should throw documented error when endpoint returns "Not Found"', async () => {
    const mockAudioId = 'test-audio-123';
    
    (secureSunoClient.generateMusic as any).mockRejectedValue(
      new Error('Suno API Error: not implemented')
    );

    await expect(convertToWav(mockAudioId)).rejects.toThrow(
      'WAV conversion endpoint not yet available in Suno API'
    );
  });

  it('should throw error when API returns success but no WAV URL', async () => {
    const mockAudioId = 'test-audio-123';
    
    (secureSunoClient.generateMusic as any).mockResolvedValue({
      status: 'success' // Pas de wav_url
    });

    await expect(convertToWav(mockAudioId)).rejects.toThrow(
      'WAV conversion failed: No URL returned from API'
    );
  });

  it('should propagate other API errors with context', async () => {
    const mockAudioId = 'test-audio-123';
    const mockError = new Error('Network timeout');
    
    (secureSunoClient.generateMusic as any).mockRejectedValue(mockError);

    await expect(convertToWav(mockAudioId)).rejects.toThrow(
      `Failed to convert audio ${mockAudioId} to WAV: Network timeout`
    );
  });

  it('should handle unknown error types', async () => {
    const mockAudioId = 'test-audio-123';
    
    (secureSunoClient.generateMusic as any).mockRejectedValue('String error');

    await expect(convertToWav(mockAudioId)).rejects.toThrow(
      `Failed to convert audio ${mockAudioId} to WAV: Unknown error`
    );
  });

  it('should handle null response data', async () => {
    const mockAudioId = 'test-audio-123';
    
    (secureSunoClient.generateMusic as any).mockResolvedValue(null);

    await expect(convertToWav(mockAudioId)).rejects.toThrow(
      'WAV conversion failed: No URL returned from API'
    );
  });
});