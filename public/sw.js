// Service Worker for Efficient Long-Term Caching
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Cache TTL in milliseconds
const CACHE_TTL = {
  STATIC: 365 * 24 * 60 * 60 * 1000, // 1 year for static assets
  API: 5 * 60 * 1000 // 5 minutes for API calls
};

// Install event - setup caches
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.endsWith(CACHE_VERSION)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch event with TTL-based caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Determine cache strategy
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(event.request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
  } else {
    event.respondWith(handlePageRequest(event.request));
  }
});

// Handle static assets with long-term caching
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached && !isExpired(cached, CACHE_TTL.STATIC)) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const timestampedResponse = addTimestamp(response.clone());
      cache.put(request, timestampedResponse);
    }
    return response;
  } catch (error) {
    return cached || new Response('Offline', { status: 503 });
  }
}

// Handle API requests with shorter caching
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const timestampedResponse = addTimestamp(response.clone());
      cache.put(request, timestampedResponse);
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached && !isExpired(cached, CACHE_TTL.API)) {
      return cached;
    }
    throw error;
  }
}

// Handle page requests (network first)
async function handlePageRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

// Utility functions
function isStaticAsset(url) {
  return /\.(js|css|woff2?|ttf|eot|ico|png|jpg|jpeg|gif|svg|webp)$/i.test(url.pathname) ||
         url.pathname.startsWith('/assets/');
}

function addTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cache-timestamp', Date.now().toString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

function isExpired(response, ttl) {
  const timestamp = response.headers.get('sw-cache-timestamp');
  if (!timestamp) return true;
  return Date.now() - parseInt(timestamp) > ttl;
}