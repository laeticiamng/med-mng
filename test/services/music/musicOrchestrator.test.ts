import { describe, expect, it } from 'vitest';
import type { GenerateMusicPayload } from '@/music/generate';
import {
  musicOrchestrator,
  musicOrchestratorTestUtils,
  DEFAULT_TARGET_DURATION,
  MAX_SEGMENTS,
  MIN_SEGMENT_DURATION,
  RETRY_BASE_DELAY_MS,
  RETRY_MAX_DELAY_MS,
} from '@/services/musicOrchestrator';

const { createJobFromOptions, statusToProgress, isFailureStatus } = musicOrchestratorTestUtils;

describe('musicOrchestrator helpers', () => {
  const basePayload: GenerateMusicPayload = {
    model: 'V4',
    prompt: 'cardiology focus track',
    callBackUrl: 'https://example.com/hook',
    customMode: false,
    instrumental: true,
  };

  it('splits a three minute job into bounded segments', () => {
    const job = createJobFromOptions({ payload: basePayload });

    expect(job.targetDuration).toBe(DEFAULT_TARGET_DURATION);
    expect(job.segments.length).toBeGreaterThanOrEqual(3);
    expect(job.segments.length).toBeLessThanOrEqual(MAX_SEGMENTS);
    job.segments.forEach((segment, index) => {
      expect(segment.index).toBe(index);
      expect(segment.status).toBe('pending');
      expect(segment.progress).toBe(0);
    });
  });

  it('caps segment duration while respecting minimum duration', () => {
    const job = createJobFromOptions({
      payload: basePayload,
      targetDuration: 40,
      segmentDuration: 5,
    });

    expect(job.segmentDuration).toBeGreaterThanOrEqual(MIN_SEGMENT_DURATION);
    expect(job.segments.length).toBeGreaterThan(0);
    job.segments.forEach((segment) => {
      expect(segment.progress).toBe(0);
      expect(segment.status).toBe('pending');
    });
  });

  it('reuses provided metadata request ids when present', () => {
    const job = createJobFromOptions({
      payload: basePayload,
      metadata: { requestId: 'qa-ci-job' },
    });

    expect(job.metadata?.requestId).toBe('qa-ci-job');
    expect(job.requestId).toBe('qa-ci-job');
  });

  it('maps backend status to human readable progress', () => {
    expect(statusToProgress('PENDING')).toBe(5);
    expect(statusToProgress('TEXT_SUCCESS')).toBe(25);
    expect(statusToProgress('FIRST_SUCCESS')).toBe(70);
    expect(statusToProgress('SUCCESS')).toBe(100);
    expect(statusToProgress('UNKNOWN' as never)).toBe(0);
  });

  it('detects terminal failure statuses', () => {
    expect(isFailureStatus('CALLBACK_EXCEPTION')).toBe(true);
    expect(isFailureStatus('CREATE_TASK_FAILED')).toBe(true);
    expect(isFailureStatus('GENERATE_AUDIO_FAILED')).toBe(true);
    expect(isFailureStatus('SENSITIVE_WORD_ERROR')).toBe(true);
    expect(isFailureStatus('PENDING')).toBe(false);
  });

  it('computes exponential backoff with an upper bound', () => {
    const computeBackoff = (musicOrchestrator as unknown as {
      computeBackoffMs(attempt: number): number;
    }).computeBackoffMs.bind(musicOrchestrator);

    expect(computeBackoff(1)).toBe(RETRY_BASE_DELAY_MS);
    expect(computeBackoff(2)).toBe(RETRY_BASE_DELAY_MS * 2);
    expect(computeBackoff(3)).toBe(RETRY_BASE_DELAY_MS * 4);
    expect(computeBackoff(6)).toBe(RETRY_MAX_DELAY_MS);
  });
});
