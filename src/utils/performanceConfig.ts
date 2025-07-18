export const PERFORMANCE_CONFIG = {
  INTERSECTION_THRESHOLD: 0.1,
  PRELOAD_DISTANCE: 2,
  MAX_AUDIO_CACHE_SIZE: 50 * 1024 * 1024,
  MAX_IMAGE_CACHE_SIZE: 20 * 1024 * 1024,
  CACHE_EXPIRY: 24 * 60 * 60 * 1000,
  SEARCH_DEBOUNCE: 300,
  SCROLL_THROTTLE: 16,
  RESIZE_THROTTLE: 100,
  CHUNK_SIZE_LIMIT: 244 * 1024,
}

export const setupWebVitals = () => {
  if ('web-vital' in window) {
    import('web-vitals').then(({ getLCP, getFID, getCLS, getFCP, getTTFB }) => {
      getLCP(console.log)
      getFID(console.log)
      getCLS(console.log)
      getFCP(console.log)
      getTTFB(console.log)
    })
  }
}

export const addResourceHints = () => {
  const head = document.head

  const preconnectDomains = [
    'https://api.suno.ai',
    'https://yancoxnhqpkexgrek.supabase.co',
  ]

  preconnectDomains.forEach((domain) => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    head.appendChild(link)
  })

  const dnsPrefetchDomains = ['https://cdnjs.cloudflare.com']

  dnsPrefetchDomains.forEach((domain) => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    head.appendChild(link)
  })
}
