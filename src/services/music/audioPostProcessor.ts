import type { MusicJobSegment } from '@/types/music';

const CROSSFADE_SECONDS = 2.5;
const TARGET_LUFS = -14;

interface DecodedSegment {
  id: string;
  buffer: AudioBuffer;
}

interface NormalizationResult {
  targetLUFS: number;
  measuredLUFS: number;
  appliedGainDb: number;
}

export interface FinalMixResult {
  url: string;
  normalization: NormalizationResult;
  duration: number;
}

type OfflineAudioContextCtor = new (
  numberOfChannels: number,
  length: number,
  sampleRate: number,
) => OfflineAudioContext;

type AudioContextCtor = new () => AudioContext;

const isBrowser = typeof window !== 'undefined';

function getAudioContextCtor(): AudioContextCtor | undefined {
  if (!isBrowser) return undefined;
  return (window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext) as
    | AudioContextCtor
    | undefined;
}

function getOfflineAudioContextCtor(): OfflineAudioContextCtor | undefined {
  if (!isBrowser) return undefined;
  return (
    window.OfflineAudioContext ??
    (window as unknown as { webkitOfflineAudioContext?: OfflineAudioContextCtor }).webkitOfflineAudioContext
  ) as OfflineAudioContextCtor | undefined;
}

async function decodeSegments(segments: MusicJobSegment[], AudioContextCtor: AudioContextCtor): Promise<DecodedSegment[]> {
  const context = new AudioContextCtor();
  try {
    const decoded: DecodedSegment[] = [];
    for (const segment of segments) {
      if (!segment.audioUrl) {
        throw new Error(`Segment ${segment.id} is missing audioUrl`);
      }

      const response = await fetch(segment.audioUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Unable to fetch audio for segment ${segment.id} (${response.status})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = await context.decodeAudioData(arrayBuffer.slice(0));
      decoded.push({ id: segment.id, buffer });
    }
    return decoded;
  } finally {
    await context.close();
  }
}

function computeTotalDuration(buffers: DecodedSegment[]): number {
  return buffers.reduce((duration, current, index) => {
    if (index === 0) {
      return current.buffer.duration;
    }
    const previous = buffers[index - 1];
    const overlap = Math.min(
      CROSSFADE_SECONDS,
      previous.buffer.duration / 2,
      current.buffer.duration / 2,
    );
    return duration + Math.max(0, current.buffer.duration - overlap);
  }, 0);
}

function scheduleSegments(
  context: OfflineAudioContext,
  buffers: DecodedSegment[],
): { lastCursor: number } {
  const masterGain = context.createGain();
  masterGain.connect(context.destination);

  let cursor = 0;
  const scheduled: Array<{ gain: GainNode; start: number; duration: number }> = [];

  buffers.forEach((entry, index) => {
    const source = context.createBufferSource();
    source.buffer = entry.buffer;
    const gainNode = context.createGain();
    source.connect(gainNode).connect(masterGain);

    const duration = entry.buffer.duration;
    const fadeDuration = index === 0
      ? 0
      : Math.min(CROSSFADE_SECONDS, scheduled[index - 1].duration / 2, duration / 2);

    const startAt = index === 0 ? 0 : cursor - fadeDuration;

    if (fadeDuration > 0) {
      const previous = scheduled[index - 1];
      const fadeOutStart = previous.start + previous.duration - fadeDuration;
      previous.gain.gain.cancelScheduledValues(fadeOutStart);
      previous.gain.gain.setValueAtTime(previous.gain.gain.value, fadeOutStart);
      previous.gain.gain.linearRampToValueAtTime(0, previous.start + previous.duration);

      gainNode.gain.setValueAtTime(0, startAt);
      gainNode.gain.linearRampToValueAtTime(1, startAt + fadeDuration);
    } else {
      gainNode.gain.setValueAtTime(1, startAt);
    }

    source.start(startAt);
    scheduled.push({ gain: gainNode, start: startAt, duration });
    cursor = startAt + duration;
  });

  return { lastCursor: cursor };
}

function normalizeBuffer(buffer: AudioBuffer, targetLUFS: number): NormalizationResult {
  const channelCount = buffer.numberOfChannels;
  if (channelCount === 0) {
    return { targetLUFS, measuredLUFS: targetLUFS, appliedGainDb: 0 };
  }

  let sumSquares = 0;
  let peak = 0;
  for (let channel = 0; channel < channelCount; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i += 1) {
      const sample = data[i];
      sumSquares += sample * sample;
      if (Math.abs(sample) > peak) {
        peak = Math.abs(sample);
      }
    }
  }

  const totalSamples = buffer.length * channelCount;
  const rms = Math.sqrt(sumSquares / Math.max(1, totalSamples));
  const measuredLUFS = 20 * Math.log10(rms || 1e-6);
  let gainDb = targetLUFS - measuredLUFS;
  const gainLinear = 10 ** (gainDb / 20);
  const predictedPeak = peak * gainLinear;

  if (predictedPeak > 1) {
    const clipReductionDb = 20 * Math.log10(1 / Math.max(1e-6, peak));
    gainDb = Math.min(gainDb, clipReductionDb);
  }

  const appliedGainLinear = 10 ** (gainDb / 20);
  for (let channel = 0; channel < channelCount; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i += 1) {
      data[i] *= appliedGainLinear;
    }
  }

  return { targetLUFS, measuredLUFS, appliedGainDb: gainDb };
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  let offset = 0;

  function writeString(data: string) {
    for (let i = 0; i < data.length; i += 1) {
      view.setUint8(offset + i, data.charCodeAt(i));
    }
    offset += data.length;
  }

  function writeUint32(value: number) {
    view.setUint32(offset, value, true);
    offset += 4;
  }

  function writeUint16(value: number) {
    view.setUint16(offset, value, true);
    offset += 2;
  }

  writeString('RIFF');
  writeUint32(bufferLength - 8);
  writeString('WAVE');
  writeString('fmt ');
  writeUint32(16);
  writeUint16(format);
  writeUint16(numberOfChannels);
  writeUint32(sampleRate);
  writeUint32(sampleRate * blockAlign);
  writeUint16(blockAlign);
  writeUint16(bitDepth);
  writeString('data');
  writeUint32(dataLength);

  const interleaved = new Int16Array(dataLength / bytesPerSample);
  let interleavedIndex = 0;

  const channelData: Float32Array[] = [];
  for (let channel = 0; channel < numberOfChannels; channel += 1) {
    channelData.push(buffer.getChannelData(channel));
  }

  for (let i = 0; i < buffer.length; i += 1) {
    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      const sample = channelData[channel][i];
      const clamped = Math.max(-1, Math.min(1, sample));
      interleaved[interleavedIndex] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      interleavedIndex += 1;
    }
  }

  new Int16Array(arrayBuffer, offset, interleaved.length).set(interleaved);

  return arrayBuffer;
}

export async function buildFinalMix(segments: MusicJobSegment[]): Promise<FinalMixResult | null> {
  if (!isBrowser) return null;
  if (segments.length === 0) {
    throw new Error('No segments available for final mix');
  }

  const AudioContextCtor = getAudioContextCtor();
  const OfflineContextCtor = getOfflineAudioContextCtor();

  if (!AudioContextCtor || !OfflineContextCtor) {
    return null; // WebAudio not available (SSR or unsupported browser)
  }

  const orderedSegments = [...segments].sort((a, b) => a.index - b.index);
  const decoded = await decodeSegments(orderedSegments, AudioContextCtor);
  const sampleRate = decoded[0].buffer.sampleRate;
  const numberOfChannels = decoded.reduce((max, entry) => Math.max(max, entry.buffer.numberOfChannels), 1);
  const totalDuration = computeTotalDuration(decoded);
  const length = Math.ceil(totalDuration * sampleRate);

  const offlineContext = new OfflineContextCtor(numberOfChannels, length, sampleRate);
  scheduleSegments(offlineContext, decoded);
  const renderedBuffer = await offlineContext.startRendering();
  const normalization = normalizeBuffer(renderedBuffer, TARGET_LUFS);
  const wavArrayBuffer = audioBufferToWav(renderedBuffer);
  const blob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);

  return {
    url,
    normalization,
    duration: renderedBuffer.duration,
  };
}
