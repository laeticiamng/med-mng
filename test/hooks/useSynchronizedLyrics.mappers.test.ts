import { describe, expect, it } from 'vitest';
import { lyricsMapperTestUtils } from '@/hooks/useSynchronizedLyrics';

const { mapSegmentToLyricsLine, linesToSegments, buildLyricsFromMetadata } = lyricsMapperTestUtils;

describe('useSynchronizedLyrics mappers', () => {
  it('normalises raw segments into safe lyric lines', () => {
    const line = mapSegmentToLyricsLine({
      track_id: 'track-1',
      idx: 0,
      start_ms: -250,
      end_ms: 300,
      text: 'Bonjour le monde',
    });

    expect(line.startMs).toBeGreaterThanOrEqual(0);
    expect(line.endMs).toBeGreaterThan(line.startMs);
    expect(line.text).toBe('Bonjour le monde');
    expect(line.time).toBe(line.startMs / 1000);
  });

  it('sorts and stretches lyric lines when building segments payload', () => {
    const segments = linesToSegments(
      [
        { time: 2, text: 'deux', startMs: 2050, endMs: 2500, role: null },
        { time: 0, text: 'zero', startMs: 0, endMs: 600, role: 'intro' },
        { time: 4, text: 'quatre', startMs: 4050, endMs: 4300, role: null },
        { time: 3, text: 'trois', startMs: 3000, endMs: 3000, role: null },
      ] as any,
      'track-42',
    );

    expect(segments).toHaveLength(4);
    expect(segments[0].text).toBe('zero');
    expect(segments[0].role).toBe('intro');
    segments.reduce((lastEnd, segment) => {
      expect(segment.startMs).toBeGreaterThanOrEqual(lastEnd);
      expect(segment.endMs).toBeGreaterThan(segment.startMs);
      return segment.endMs;
    }, 0);
  });

  it('reconstructs lines from camelCase or snake_case metadata', () => {
    const camel = buildLyricsFromMetadata(
      {
        lyricsSegments: [
          { idx: 0, startMs: 0, endMs: 1800, text: 'Camel case', role: 'verse' },
        ],
        total_duration_ms: 2400,
      },
      null,
    );

    expect(camel?.source).toBe('manual');
    expect(camel?.lines[0].role).toBe('verse');

    const snake = buildLyricsFromMetadata(
      {
        lyrics_segments: [
          { idx: 0, start_ms: 0, end_ms: 1500, text: 'Snake case' },
          { idx: 1, start_ms: 1600, end_ms: 3200, text: 'Suite' },
        ],
        duration: 4,
      },
      null,
    );

    expect(snake?.lines).toHaveLength(2);
    expect(snake?.lines[0].text).toBe('Snake case');
    expect(snake?.lines[1].endMs).toBeGreaterThan(snake!.lines[1].startMs);
  });
});
