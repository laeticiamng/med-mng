import { Worker, Job } from 'bullmq'
import { SupabaseClient } from '@supabase/supabase-js'
import Redis from 'ioredis'
import nodemailer from 'nodemailer'
import { config } from '../config'

interface NotificationJob {
  type: 'study_reminder' | 'streak_milestone' | 'achievement' | 'quota_warning'
  userId: string
  data: any
}

export class NotificationWorker {
  name = 'NotificationWorker'
  private worker: Worker
  private mailer: nodemailer.Transporter

  constructor(private redis: Redis, private supabase: SupabaseClient) {
    this.mailer = nodemailer.createTransport(config.smtp)

    this.worker = new Worker(
      'notifications',
      async (job: Job<NotificationJob>) => {
        return this.process(job)
      },
      {
        connection: redis,
        concurrency: 20,
      },
    )
  }

  async process(job: Job<NotificationJob>) {
    const { type, userId, data } = job.data

    try {
      // Get user details
      const { data: user } = await this.supabase
        .from('user_profiles')
        .select('*, auth.users(email)')
        .eq('id', userId)
        .single()

      if (!user) throw new Error('User not found')

      switch (type) {
        case 'study_reminder':
          await this.sendStudyReminder(user, data)
          break
        case 'streak_milestone':
          await this.sendStreakMilestone(user, data)
          break
        case 'achievement':
          await this.sendAchievementUnlocked(user, data)
          break
        case 'quota_warning':
          await this.sendQuotaWarning(user, data)
          break
      }

      return { success: true }
    } catch (error) {
      console.error('Notification error:', error)
      throw error
    }
  }

  private async sendStudyReminder(user: any, data: any) {
    const email = user.auth?.users?.email
    if (!email) return

    await this.mailer.sendMail({
      from: config.smtp.from,
      to: email,
      subject: '🎵 Time for your daily medical study session!',
      html: `
        <h2>Hi ${user.display_name || 'there'}!</h2>
        <p>It's time for your daily study session. Keep your ${user.streak_days}-day streak going!</p>
        <p>Today's recommended topics:</p>
        <ul>
          ${data.topics.map((t: any) => `<li>${t.name}</li>`).join('')}
        </ul>
        <p><a href="${config.appUrl}/study">Start Learning</a></p>
      `,
    })
  }

  private async sendStreakMilestone(user: any, data: any) {
    const email = user.auth?.users?.email
    if (!email) return

    await this.mailer.sendMail({
      from: config.smtp.from,
      to: email,
      subject: `🔥 ${data.days}-Day Streak Achievement!`,
      html: `
        <h2>Congratulations ${user.display_name || 'there'}!</h2>
        <p>You've reached a ${data.days}-day learning streak! 🎉</p>
        <p>You've earned ${data.points} points and unlocked a new achievement.</p>
        <p>Keep up the amazing work!</p>
      `,
    })
  }

  private async sendAchievementUnlocked(user: any, data: any) {
    // Implementation for achievement notifications
  }

  private async sendQuotaWarning(user: any, data: any) {
    // Implementation for quota warnings
  }

  async start() {
    await this.worker.run()
  }

  async close() {
    await this.worker.close()
  }
}
