/**
 * Tests unitaires pour la génération vidéo
 * Couvre les chemins d'erreur et les scénarios de validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateVideo, type VideoGenerationOptions } from '@/utils/video';

// Mock du secureApiClient
vi.mock('@/lib/secureApiClient', () => ({
  secureSunoClient: {
    generateMusic: vi.fn()
  }
}));

import { secureSunoClient } from '@/lib/secureApiClient';

describe('generateVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error when audioId is empty', async () => {
    await expect(generateVideo('')).rejects.toThrow(
      'AudioId is required for video generation'
    );
  });

  it('should throw error when audioId is null/undefined', async () => {
    await expect(generateVideo(null as any)).rejects.toThrow(
      'AudioId is required for video generation'
    );
    
    await expect(generateVideo(undefined as any)).rejects.toThrow(
      'AudioId is required for video generation'
    );
  });

  it('should return video URL when API call succeeds with default options', async () => {
    const mockAudioId = 'test-audio-789';
    const mockVideoUrl = 'https://example.com/video.mp4';
    
    (secureSunoClient.generateMusic as any).mockResolvedValue({
      video_url: mockVideoUrl
    });

    const result = await generateVideo(mockAudioId);
    
    expect(result).toBe(mockVideoUrl);
    expect(secureSunoClient.generateMusic).toHaveBeenCalledWith({
      action: 'generate_video',
      audioId: mockAudioId,
      visual_style: 'waveform',
      resolution: '1080p',
      color_scheme: ['#1e40af', '#3b82f6', '#60a5fa'],
      include_lyrics: true,
      output_format: 'mp4'
    });
  });

  it('should use custom options when provided', async () => {
    const mockAudioId = 'test-audio-789';
    const mockVideoUrl = 'https://example.com/video.mp4';
    const options: VideoGenerationOptions = {
      visualStyle: 'abstract',
      resolution: '4k',
      colorScheme: ['#ff0000', '#00ff00'],
      includeLyrics: false
    };
    
    (secureSunoClient.generateMusic as any).mockResolvedValue({
      video_url: mockVideoUrl
    });

    const result = await generateVideo(mockAudioId, options);
    
    expect(result).toBe(mockVideoUrl);
    expect(secureSunoClient.generateMusic).toHaveBeenCalledWith({
      action: 'generate_video',
      audioId: mockAudioId,
      visual_style: 'abstract',
      resolution: '4k',
      color_scheme: ['#ff0000', '#00ff00'],
      include_lyrics: false,
      output_format: 'mp4'
    });
  });

  it('should throw documented error when endpoint returns 404', async () => {
    const mockAudioId = 'test-audio-789';
    
    (secureSunoClient.generateMusic as any).mockRejectedValue(
      new Error('Suno API Error: invalid action')
    );

    await expect(generateVideo(mockAudioId)).rejects.toThrow(
      'Video generation endpoint not yet available in Suno API'
    );
    
    await expect(generateVideo(mockAudioId)).rejects.toThrow(
      `AudioId: ${mockAudioId}`
    );
    
    await expect(generateVideo(mockAudioId)).rejects.toThrow(
      'This feature requires AI video synthesis capabilities'
    );
    
    await expect(generateVideo(mockAudioId)).rejects.toThrow(
      'Consider using alternative video generation services'
    );
  });

  it('should throw documented error when endpoint returns "Not Found"', async () => {
    const mockAudioId = 'test-audio-789';
    
    (secureSunoClient.generateMusic as any).mockRejectedValue(
      new Error('Suno API Error: not implemented')
    );

    await expect(generateVideo(mockAudioId)).rejects.toThrow(
      'Video generation endpoint not yet available in Suno API'
    );
  });

  it('should throw error when API returns success but no video URL', async () => {
    const mockAudioId = 'test-audio-789';
    
    (secureSunoClient.generateMusic as any).mockResolvedValue({
      status: 'rendering' // Pas de video_url
    });

    await expect(generateVideo(mockAudioId)).rejects.toThrow(
      'Video generation failed: No video URL returned from API'
    );
  });

  it('should propagate other API errors with context', async () => {
    const mockAudioId = 'test-audio-789';
    const mockError = new Error('Video generation quota exceeded');
    
    (secureSunoClient.generateMusic as any).mockRejectedValue(mockError);

    await expect(generateVideo(mockAudioId)).rejects.toThrow(
      `Failed to generate video for audio ${mockAudioId}: Video generation quota exceeded`
    );
  });

  it('should handle unknown error types', async () => {
    const mockAudioId = 'test-audio-789';
    
    (secureSunoClient.generateMusic as any).mockRejectedValue('String error');

    await expect(generateVideo(mockAudioId)).rejects.toThrow(
      `Failed to generate video for audio ${mockAudioId}: Unknown error`
    );
  });

  it('should handle null response data', async () => {
    const mockAudioId = 'test-audio-789';
    
    (secureSunoClient.generateMusic as any).mockResolvedValue(null);

    await expect(generateVideo(mockAudioId)).rejects.toThrow(
      'Video generation failed: No video URL returned from API'
    );
  });

  it('should validate video generation options types', () => {
    const mockAudioId = 'test-audio-789';
    
    // Ces appels ne doivent pas causer d'erreurs TypeScript
    const options1: VideoGenerationOptions = {
      visualStyle: 'waveform'
    };
    
    const options2: VideoGenerationOptions = {
      resolution: '720p',
      colorScheme: ['#123456']
    };
    
    const options3: VideoGenerationOptions = {
      includeLyrics: true
    };
    
    expect(options1.visualStyle).toBe('waveform');
    expect(options2.resolution).toBe('720p');
    expect(options3.includeLyrics).toBe(true);
  });
});