const CACHE_NAME = 'med-mng-v1'
const STATIC_CACHE = 'static-v1'
const AUDIO_CACHE = 'audio-v1'
const API_CACHE = 'api-v1'

const STATIC_ASSETS = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== AUDIO_CACHE &&
              cacheName !== API_CACHE
            ) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.destination === 'audio' || url.pathname.includes('.mp3')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response
          }

          return fetch(request).then((fetchResponse) => {
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone())
            }
            return fetchResponse
          })
        })
      })
    )
    return
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (request.method === 'GET' && response.ok) {
            const responseClone = response.clone()
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request)
        })
    )
    return
  }

  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((fetchResponse) => {
            if (fetchResponse.ok) {
              const responseClone = fetchResponse.clone()
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone)
              })
            }
            return fetchResponse
          })
        )
      })
    )
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/')
      })
    )
    return
  }
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_AUDIO_CACHE') {
    cleanAudioCache()
  }
})

async function cleanAudioCache() {
  const cache = await caches.open(AUDIO_CACHE)
  const requests = await cache.keys()

  if (requests.length > 10) {
    const toDelete = requests.slice(0, requests.length - 10)
    await Promise.all(toDelete.map((req) => cache.delete(req)))
  }
}
