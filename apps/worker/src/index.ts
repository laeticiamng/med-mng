import { createClient } from '@supabase/supabase-js'
import { Queue } from 'bullmq'
import Redis from 'ioredis'
import { config } from './config'
import { MusicGenerationWorker } from './workers/musicGeneration'
import { ContentProcessingWorker } from './workers/contentProcessing'
import { NotificationWorker } from './workers/notifications'
import { AnalyticsWorker } from './workers/analytics'

// Initialize Redis connection
const redis = new Redis(config.redis.url)

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.serviceKey)

// Initialize queues
export const queues = {
  musicGeneration: new Queue('music-generation', { connection: redis }),
  contentProcessing: new Queue('content-processing', { connection: redis }),
  notifications: new Queue('notifications', { connection: redis }),
  analytics: new Queue('analytics', { connection: redis }),
}

// Initialize workers
const workers = [
  new MusicGenerationWorker(redis, supabase),
  new ContentProcessingWorker(redis, supabase),
  new NotificationWorker(redis, supabase),
  new AnalyticsWorker(redis, supabase),
]

// Start all workers
workers.forEach((worker) => {
  console.log(`Starting worker: ${worker.name}`)
  worker.start()
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing workers...')
  await Promise.all(workers.map((w) => w.close()))
  await redis.quit()
  process.exit(0)
})
