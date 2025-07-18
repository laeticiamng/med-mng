export interface Song {
  id: string
  title: string
  audio_url: string
  video_url?: string
  status: 'generating' | 'complete' | 'error'
  style: string
  duration: string
  prompt: string
  created_at: string
  suno_id?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

export interface GenerateParams {
  prompt: string
  style: string
  duration: string
  title?: string
}

export type PageType = 'musique' | 'rang-a' | 'rang-b' | 'quiz' | 'scene' | 'bd' | 'roman'
