import { useEffect, useState } from 'react';

interface UseRateLimitCountdownOptions {
  retryAt?: number | null;
  fallbackSeconds?: number;
}

export function useRateLimitCountdown({ retryAt, fallbackSeconds }: UseRateLimitCountdownOptions) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (retryAt) {
      return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
    }
    if (fallbackSeconds) {
      return Math.max(0, Math.ceil(fallbackSeconds));
    }
    return 0;
  });

  useEffect(() => {
    const computeRemaining = () => {
      if (retryAt) {
        return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
      }
      if (fallbackSeconds) {
        return Math.max(0, Math.ceil(fallbackSeconds));
      }
      return 0;
    };

    setRemainingSeconds(computeRemaining());

    if (!retryAt && !fallbackSeconds) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds(computeRemaining());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [retryAt, fallbackSeconds]);

  return remainingSeconds;
}
