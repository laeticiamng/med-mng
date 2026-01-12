const EDN_CACHE_BUSTER_KEY = 'edn_cache_buster';

export const getEdnCacheBuster = (): string => {
  if (typeof window === 'undefined') {
    return '0';
  }

  return window.localStorage.getItem(EDN_CACHE_BUSTER_KEY) ?? '0';
};

export const bumpEdnCacheBuster = (reason = 'manual'): string => {
  if (typeof window === 'undefined') {
    return '0';
  }

  const value = `${Date.now()}`;
  window.localStorage.setItem(EDN_CACHE_BUSTER_KEY, value);
  window.dispatchEvent(
    new CustomEvent('edn-cache-buster', { detail: { value, reason } })
  );
  return value;
};

export const subscribeEdnCacheBuster = (onChange: (value: string) => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<{ value?: string }>;
    onChange(customEvent.detail?.value ?? getEdnCacheBuster());
  };

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === EDN_CACHE_BUSTER_KEY) {
      onChange(event.newValue ?? '0');
    }
  };

  window.addEventListener('edn-cache-buster', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('edn-cache-buster', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};

export const appendEdnCacheParams = (
  url: string,
  cacheBuster: string,
  forceRefresh = false
): string => {
  const nextUrl = new URL(url);

  if (cacheBuster) {
    nextUrl.searchParams.set('cache_bust', cacheBuster);
  }

  if (forceRefresh) {
    nextUrl.searchParams.set('refresh', `${Date.now()}`);
  }

  return nextUrl.toString();
};

export const pickCacheDiagnostics = (headers: Headers) => {
  const keys = [
    'cache-control',
    'cf-cache-status',
    'age',
    'etag',
    'x-cache',
    'x-cache-hits',
    'x-served-by',
    'server',
    'date'
  ];

  return keys.reduce<Record<string, string>>((acc, key) => {
    const value = headers.get(key);
    if (value) {
      acc[key] = value;
    }
    return acc;
  }, {});
};
