// Service Worker for efficient client-side caching
const CACHE_NAME = 'med-mng-v1';
const STATIC_CACHE_NAME = 'med-mng-static-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap'
];

// Cache strategies for different asset types
const CACHE_STRATEGIES = {
  // Static assets (JS, CSS) - Cache First with long TTL
  static: /\.(js|css|woff2?|ttf|eot)$/,
  // Images - Cache First
  images: /\.(png|jpg|jpeg|svg|gif|webp|ico)$/,
  // API calls - Network First with fallback
  api: /\/api\//,
  // Supabase calls - Network First with short cache
  supabase: /supabase\.co/
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Static assets - Cache First (long-term caching)
    if (CACHE_STRATEGIES.static.test(url.pathname)) {
      return await cacheFirst(request, CACHE_NAME, 31536000); // 1 year
    }
    
    // Images - Cache First
    if (CACHE_STRATEGIES.images.test(url.pathname)) {
      return await cacheFirst(request, CACHE_NAME, 2592000); // 30 days
    }
    
    // API calls - Network First with fallback
    if (CACHE_STRATEGIES.api.test(url.pathname)) {
      return await networkFirst(request, CACHE_NAME, 300); // 5 minutes
    }
    
    // Supabase calls - Network First with short cache
    if (CACHE_STRATEGIES.supabase.test(url.hostname)) {
      return await networkFirst(request, CACHE_NAME, 60); // 1 minute
    }
    
    // HTML pages - Network First with fallback
    if (request.destination === 'document') {
      return await networkFirst(request, CACHE_NAME, 0); // No cache for HTML
    }
    
    // Default - Network First
    return await networkFirst(request, CACHE_NAME, 3600); // 1 hour
    
  } catch (error) {
    console.warn('SW: Fetch error:', error);
    return fetch(request);
  }
}

// Cache First strategy - good for static assets
async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cache is still fresh
    const cachedDate = new Date(cachedResponse.headers.get('date') || 0);
    const now = new Date();
    const age = (now - cachedDate) / 1000;
    
    if (age < maxAge) {
      return cachedResponse;
    }
  }
  
  // Fetch from network and cache
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    // Return cached version even if stale
    return cachedResponse || new Response('Network error', { status: 408 });
  }
}

// Network First strategy - good for dynamic content
async function networkFirst(request, cacheName, maxAge) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && maxAge > 0) {
      const cache = await caches.open(cacheName);
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}