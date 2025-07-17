import Redis from 'ioredis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const redis = redisUrl ? new Redis(redisUrl, { password: redisToken }) : null

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null
  const data = await redis.get(key)
  return data ? JSON.parse(data) as T : null
}

export async function setCache<T>(key: string, value: T, ttl = 300): Promise<void> {
  if (!redis) return
  await redis.set(key, JSON.stringify(value), 'EX', ttl)
}
