export interface RateLimitErrorInfo {
  isRateLimited: boolean;
  message: string;
  retryAfterSeconds?: number;
}

function parseJSON(value: unknown): any | null {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractRetryAfterSeconds(source: any): number | undefined {
  if (!source) return undefined;

  const candidates = [
    source.retryAfterSeconds,
    source.retry_after_seconds,
    source.retry_after,
    source.retryAfter,
  ];

  const value = candidates.find((candidate) => typeof candidate === 'number' || typeof candidate === 'string');

  if (value === undefined) {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : undefined;
}

export function describeRateLimitError(
  error: unknown,
  fallbackMessage: string
): RateLimitErrorInfo {
  if (!error) {
    return { isRateLimited: false, message: fallbackMessage };
  }

  const status = (error as any)?.status ?? (error as any)?.context?.status ?? (error as any)?.cause?.status;
  const message = (error as any)?.message ?? fallbackMessage;

  const looksLikeRateLimit =
    status === 429 ||
    (typeof message === 'string' && message.includes('429')) ||
    (error as any)?.name === 'FunctionsRateLimitError';

  if (!looksLikeRateLimit) {
    return { isRateLimited: false, message: fallbackMessage };
  }

  const parsedMessage = parseJSON(message);
  const parsedDetails = parseJSON((error as any)?.details ?? (error as any)?.context ?? (error as any)?.body);

  const rateLimitPayload = parsedMessage ?? parsedDetails ?? {};

  const retryAfterSeconds = extractRetryAfterSeconds(rateLimitPayload);
  const detailedMessage =
    typeof rateLimitPayload.message === 'string'
      ? rateLimitPayload.message
      : typeof message === 'string'
        ? message
        : fallbackMessage;

  let humanMessage = detailedMessage;

  if (retryAfterSeconds && Number.isFinite(retryAfterSeconds)) {
    if (retryAfterSeconds >= 60) {
      const minutes = Math.ceil(retryAfterSeconds / 60);
      humanMessage = `${detailedMessage} Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}.`;
    } else {
      humanMessage = `${detailedMessage} Réessayez dans ${retryAfterSeconds} seconde${retryAfterSeconds > 1 ? 's' : ''}.`;
    }
  }

  return {
    isRateLimited: true,
    message: humanMessage,
    retryAfterSeconds,
  };
}
