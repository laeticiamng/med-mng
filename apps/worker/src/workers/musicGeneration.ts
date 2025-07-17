import { Worker, Job } from 'bullmq'
import { SupabaseClient } from '@supabase/supabase-js'
import Redis from 'ioredis'
import axios from 'axios'
import { config } from '../config'

interface MusicGenerationJob {
  songId: string
  userId: string
  prompt: string
  topicId: string
  medicalContent: any
}

export class MusicGenerationWorker {
  name = 'MusicGenerationWorker'
  private worker: Worker

  constructor(private redis: Redis, private supabase: SupabaseClient) {
    this.worker = new Worker(
      'music-generation',
      async (job: Job<MusicGenerationJob>) => {
        return this.process(job)
      },
      {
        connection: redis,
        concurrency: 5,
        limiter: {
          max: 10,
          duration: 60000, // 10 per minute
        },
      },
    )

    this.worker.on('completed', (job) => {
      console.log(`Music generation completed: ${job.id}`)
    })

    this.worker.on('failed', (job, err) => {
      console.error(`Music generation failed: ${job?.id}`, err)
    })
  }

  async process(job: Job<MusicGenerationJob>) {
    const { songId, userId, prompt, topicId, medicalContent } = job.data

    try {
      // Update song status
      await this.updateSongStatus(songId, 'generating')

      // Check user quota
      const hasQuota = await this.checkUserQuota(userId)
      if (!hasQuota) {
        throw new Error('User quota exceeded')
      }

      // Generate with Suno API
      const sunoResponse = await this.generateWithSuno(prompt, medicalContent)

      // Update song with generated data
      await this.supabase
        .from('songs')
        .update({
          suno_id: sunoResponse.id,
          audio_url: sunoResponse.audio_url,
          image_url: sunoResponse.image_url,
          lyrics: sunoResponse.lyrics,
          duration: sunoResponse.duration,
          status: 'completed',
        })
        .eq('id', songId)

      // Update user quota
      await this.updateUserQuota(userId)

      // Trigger content processing
      await job.queue.add('content-processing', {
        songId,
        lyrics: sunoResponse.lyrics,
        topicId,
      })

      return {
        success: true,
        songId,
        sunoId: sunoResponse.id,
      }
    } catch (error) {
      await this.updateSongStatus(songId, 'failed')
      throw error
    }
  }

  private async generateWithSuno(prompt: string, medicalContent: any) {
    // Enhance prompt with medical content
    const enhancedPrompt = this.buildEnhancedPrompt(prompt, medicalContent)

    // Call Suno API
    const response = await axios.post(
      `${config.suno.apiUrl}/api/generate/v2`,
      {
        prompt: enhancedPrompt,
        make_instrumental: false,
        wait_audio: true,
      },
      {
        headers: {
          Authorization: `Bearer ${config.suno.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if ((response.data as any).error) {
      throw new Error(`Suno API error: ${(response.data as any).error}`)
    }

    return response.data
  }

  private buildEnhancedPrompt(basePrompt: string, medicalContent: any): string {
    const { terms, concepts, mnemonics } = medicalContent

    let prompt = basePrompt

    // Add medical terms naturally
    if (terms && terms.length > 0) {
      prompt += `\nInclude these medical terms: ${terms.join(', ')}`
    }

    // Add key concepts
    if (concepts && concepts.length > 0) {
      prompt += `\nFocus on these concepts: ${concepts.join(', ')}`
    }

    // Add mnemonic if provided
    if (mnemonics) {
      prompt += `\nUse this mnemonic: ${mnemonics}`
    }

    // Add style guidance
    prompt +=
      '\nStyle: Educational, memorable, catchy melody, clear pronunciation'

    return prompt
  }

  private async checkUserQuota(userId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('generation_quotas')
      .select('daily_used, daily_limit, monthly_used, monthly_limit')
      .eq('user_id', userId)
      .single()

    if (!data) return false

    return data.daily_used < data.daily_limit && data.monthly_used < data.monthly_limit
  }

  private async updateUserQuota(userId: string) {
    await this.supabase.rpc('increment_quota_usage', { p_user_id: userId })
  }

  private async updateSongStatus(songId: string, status: string) {
    await this.supabase.from('songs').update({ status }).eq('id', songId)
  }

  async start() {
    await this.worker.run()
  }

  async close() {
    await this.worker.close()
  }
}
