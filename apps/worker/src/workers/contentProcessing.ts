import { Worker, Job } from 'bullmq'
import { SupabaseClient } from '@supabase/supabase-js'
import Redis from 'ioredis'
import OpenAI from 'openai'
import { config } from '../config'

interface ContentProcessingJob {
  songId: string
  lyrics: string
  topicId: string
}

export class ContentProcessingWorker {
  name = 'ContentProcessingWorker'
  private worker: Worker
  private openai: OpenAI

  constructor(private redis: Redis, private supabase: SupabaseClient) {
    this.openai = new OpenAI({ apiKey: config.openai.apiKey })

    this.worker = new Worker(
      'content-processing',
      async (job: Job<ContentProcessingJob>) => {
        return this.process(job)
      },
      {
        connection: redis,
        concurrency: 10,
      },
    )
  }

  async process(job: Job<ContentProcessingJob>) {
    const { songId, lyrics, topicId } = job.data

    try {
      // Extract medical content from lyrics
      const medicalInfo = await this.extractMedicalContent(lyrics, topicId)

      // Generate quiz questions
      const quizQuestions = await this.generateQuizQuestions(medicalInfo, topicId)

      // Update song with extracted content
      await this.supabase.from('songs').update({ medical_content: medicalInfo }).eq('id', songId)

      // Insert quiz questions
      if (quizQuestions.length > 0) {
        await this.supabase.from('quiz_questions').insert(quizQuestions)
      }

      // Track analytics
      await job.queue.add('analytics', {
        event_name: 'content_processed',
        event_data: {
          song_id: songId,
          topic_id: topicId,
          quiz_count: quizQuestions.length,
        },
      })

      return { success: true, quizCount: quizQuestions.length }
    } catch (error) {
      console.error('Content processing error:', error)
      throw error
    }
  }

  private async extractMedicalContent(lyrics: string, topicId: string) {
    const { data: topic } = await this.supabase
      .from('medical_topics')
      .select('name, category')
      .eq('id', topicId)
      .single()

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Extract medical terms, concepts, and educational content from song lyrics. Return JSON format.',
        },
        {
          role: 'user',
          content: `Topic: ${topic?.name} (${topic?.category})\n\nLyrics:\n${lyrics}`,
        },
      ],
      response_format: { type: 'json_object' },
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  }

  private async generateQuizQuestions(medicalInfo: any, topicId: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Generate multiple-choice quiz questions based on medical content. Return JSON array.',
        },
        {
          role: 'user',
          content: JSON.stringify(medicalInfo),
        },
      ],
      response_format: { type: 'json_object' },
    })

    const questions = JSON.parse(response.choices[0].message.content || '{"questions":[]}').questions

    return questions.map((q: any) => ({
      topic_id: topicId,
      question: q.question,
      options: q.options,
      difficulty_level: q.difficulty || 'intermediate',
      explanation: q.explanation,
      references: q.references || [],
    }))
  }

  async start() {
    await this.worker.run()
  }

  async close() {
    await this.worker.close()
  }
}
