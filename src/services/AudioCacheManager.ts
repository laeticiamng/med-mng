class AudioCacheManager {
  private cache: Map<string, ArrayBuffer> = new Map()
  private maxCacheSize = 50 * 1024 * 1024
  private currentCacheSize = 0

  async getAudio(url: string): Promise<ArrayBuffer | null> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!
    }

    try {
      const cachedResponse = await caches.match(url)
      if (cachedResponse) {
        const arrayBuffer = await cachedResponse.arrayBuffer()
        this.addToMemoryCache(url, arrayBuffer)
        return arrayBuffer
      }
    } catch (error) {
      console.warn('Cache SW non disponible:', error)
    }

    return null
  }

  async cacheAudio(url: string, data: ArrayBuffer): Promise<void> {
    this.addToMemoryCache(url, data)

    try {
      const cache = await caches.open('audio-v1')
      const response = new Response(data, {
        headers: { 'Content-Type': 'audio/mpeg' },
      })
      await cache.put(url, response)
    } catch (error) {
      console.warn('Erreur cache SW:', error)
    }
  }

  private addToMemoryCache(url: string, data: ArrayBuffer): void {
    const dataSize = data.byteLength

    if (this.currentCacheSize + dataSize > this.maxCacheSize) {
      this.evictOldEntries(dataSize)
    }

    this.cache.set(url, data)
    this.currentCacheSize += dataSize
  }

  private evictOldEntries(neededSpace: number): void {
    const entries = Array.from(this.cache.entries())
    let freedSpace = 0

    for (const [url, data] of entries) {
      this.cache.delete(url)
      this.currentCacheSize -= data.byteLength
      freedSpace += data.byteLength

      if (freedSpace >= neededSpace) {
        break
      }
    }
  }

  clearCache(): void {
    this.cache.clear()
    this.currentCacheSize = 0

    caches.delete('audio-v1').catch(console.warn)
  }

  getCacheStats(): { size: number; count: number; maxSize: number } {
    return {
      size: this.currentCacheSize,
      count: this.cache.size,
      maxSize: this.maxCacheSize,
    }
  }
}

export const audioCacheManager = new AudioCacheManager()
