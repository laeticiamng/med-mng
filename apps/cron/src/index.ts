import { CronJob } from 'cron'
import { createClient } from '@supabase/supabase-js'
import { Queue } from 'bullmq'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const queues = {
  notifications: new Queue('notifications', { connection: redis }),
  analytics: new Queue('analytics', { connection: redis })
}

// Daily quota reset - runs at midnight
const quotaResetJob = new CronJob('0 0 * * *', async () => {
  console.log('Running daily quota reset...')
  
  try {
    await supabase.rpc('reset_daily_quotas')
    console.log('Daily quotas reset successfully')
  } catch (error) {
    console.error('Error resetting quotas:', error)
  }
})

// Study reminders - runs every hour
const studyReminderJob = new CronJob('0 * * * *', async () => {
  console.log('Checking for study reminders...')
  
  try {
    const now = new Date()
    const hour = now.getHours()
    
    // Get users who should be reminded at this hour
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, preferred_study_hour, streak_days')
      .eq('preferred_study_hour', hour)
      .eq('notifications_enabled', true)
    
    if (users && users.length > 0) {
      // Check if they've already studied today
      for (const user of users) {
        const { data: todaySession } = await supabase
          .from('learning_sessions')
          .select('id')
          .eq('user_id', user.id)
          .gte('started_at', new Date().setHours(0, 0, 0, 0))
          .single()
        
        if (!todaySession) {
          // Get recommended topics
          const { data: topics } = await supabase
            .from('user_progress')
            .select('medical_topics(id, name)')
            .eq('user_id', user.id)
            .order('last_reviewed', { ascending: true })
            .limit(3)
          
          await queues.notifications.add('send-notification', {
            type: 'study_reminder',
            userId: user.id,
            data: {
              streak_days: user.streak_days,
              topics: topics?.map(t => t.medical_topics) || []
            }
          })
        }
      }
    }
  } catch (error) {
    console.error('Error sending study reminders:', error)
  }
})

// Streak check - runs at 23:00 daily
const streakCheckJob = new CronJob('0 23 * * *', async () => {
  console.log('Checking streaks...')
  
  try {
    // Get all active users
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, streak_days')
      .gt('streak_days', 0)
    
    if (users) {
      for (const user of users) {
        // Check if they studied today
        const { data: todaySession } = await supabase
          .from('learning_sessions')
          .select('id')
          .eq('user_id', user.id)
          .gte('started_at', new Date().setHours(0, 0, 0, 0))
          .single()
        
        if (!todaySession) {
          // Reset streak
          await supabase
            .from('user_profiles')
            .update({ streak_days: 0 })
            .eq('id', user.id)
          
          // Send notification about lost streak
          await queues.notifications.add('send-notification', {
            type: 'streak_lost',
            userId: user.id,
            data: { previous_streak: user.streak_days }
          })
        }
      }
    }
  } catch (error) {
    console.error('Error checking streaks:', error)
  }
})

// Monthly quota reset - runs on the 1st of each month
const monthlyQuotaResetJob = new CronJob('0 0 1 * *', async () => {
  console.log('Running monthly quota reset...')
  
  try {
    await supabase
      .from('generation_quotas')
      .update({ 
        monthly_used: 0,
        last_reset_monthly: new Date().toISOString()
      })
      .lt('last_reset_monthly', new Date().toISOString())
    
    console.log('Monthly quotas reset successfully')
  } catch (error) {
    console.error('Error resetting monthly quotas:', error)
  }
})

// Analytics aggregation - runs every 6 hours
const analyticsJob = new CronJob('0 */6 * * *', async () => {
  console.log('Running analytics aggregation...')
  
  try {
    // Calculate daily active users
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: dau } = await supabase
      .from('learning_sessions')
      .select('user_id', { count: 'exact', head: true })
      .gte('started_at', yesterday.toISOString())
      .lt('started_at', today.toISOString())
    
    // Store aggregated metrics
    await queues.analytics.add('store-metrics', {
      event_name: 'daily_metrics',
      event_data: {
        date: yesterday.toISOString().split('T')[0],
        daily_active_users: dau || 0,
        timestamp: new Date().toISOString()
      }
    })
    
    // Calculate completion rates, average scores, etc.
    const { data: sessions } = await supabase
      .from('learning_sessions')
      .select('completed_at, score, duration_seconds')
      .gte('started_at', yesterday.toISOString())
      .lt('started_at', today.toISOString())
    
    if (sessions) {
      const completed = sessions.filter(s => s.completed_at).length
      const completionRate = sessions.length > 0 ? completed / sessions.length : 0
      const avgScore = sessions
        .filter(s => s.score !== null)
        .reduce((sum, s) => sum + s.score!, 0) / completed || 0
      
      await queues.analytics.add('store-metrics', {
        event_name: 'learning_metrics',
        event_data: {
          date: yesterday.toISOString().split('T')[0],
          total_sessions: sessions.length,
          completed_sessions: completed,
          completion_rate: completionRate,
          average_score: avgScore
        }
      })
    }
  } catch (error) {
    console.error('Error aggregating analytics:', error)
  }
})

// Achievement check - runs every hour
const achievementCheckJob = new CronJob('0 * * * *', async () => {
  console.log('Checking achievements...')
  
  try {
    // Get all achievement criteria
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
    
    if (achievements) {
      // Get active users in the last hour
      const oneHourAgo = new Date()
      oneHourAgo.setHours(oneHourAgo.getHours() - 1)
      
      const { data: recentUsers } = await supabase
        .from('learning_sessions')
        .select('user_id')
        .gte('started_at', oneHourAgo.toISOString())
        .limit(100)
      
      const userIds = [...new Set(recentUsers?.map(u => u.user_id) || [])]
      
      for (const userId of userIds) {
        await queues.analytics.add('check-achievements', {
          event_name: 'achievement_check',
          user_id: userId
        })
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error)
  }
})

// Cleanup old data - runs daily at 3 AM
const cleanupJob = new CronJob('0 3 * * *', async () => {
  console.log('Running data cleanup...')
  
  try {
    // Delete old analytics events (older than 90 days)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90)
    
    await supabase
      .from('analytics_events')
      .delete()
      .lt('created_at', threeMonthsAgo.toISOString())
    
    console.log('Cleanup completed successfully')
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
})

// Start all jobs
const jobs = [
  quotaResetJob,
  studyReminderJob,
  streakCheckJob,
  monthlyQuotaResetJob,
  analyticsJob,
  achievementCheckJob,
  cleanupJob
]

jobs.forEach(job => {
  job.start()
  console.log(`Started cron job: ${job.cronTime.source}`)
})

console.log('All cron jobs started successfully')

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, stopping cron jobs...')
  jobs.forEach(job => job.stop())
  redis.quit()
  process.exit(0)
})
