import { supabase } from "@/integrations/supabase/client";

export interface QcmQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  medical_concept: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  rang: 'A' | 'B';
}

export interface QcmSession {
  id: string;
  user_id: string;
  item_code: string;
  session_type: 'rang_a' | 'rang_b' | 'mixed';
  score: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  time_spent_seconds: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QcmResponse {
  id: string;
  session_id: string;
  question_id: string;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation?: string;
  medical_concept?: string;
  response_time_seconds: number;
  created_at: string;
}

export interface ErrorSong {
  id: string;
  user_id: string;
  session_id: string;
  song_title: string;
  lyrics: any;
  audio_url?: string;
  suno_audio_id?: string;
  generation_prompt: string;
  errors_analyzed: any[];
  generation_status: 'pending' | 'generating' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface UserQuota {
  id: string;
  user_id: string;
  subscription_type: 'standard' | 'pro' | 'premium';
  monthly_music_quota: number;
  monthly_music_used: number;
  monthly_qcm_quota: number;
  monthly_qcm_used: number;
  monthly_chat_quota: number;
  monthly_chat_used: number;
  quota_reset_date: string;
  created_at: string;
  updated_at: string;
}

class QcmService {
  async generateQcm(
    itemCode: string, 
    sessionType: 'rang_a' | 'rang_b' | 'mixed', 
    questionCount: number = 10
  ): Promise<{ success: boolean; questions: QcmQuestion[] }> {
    const { data, error } = await supabase.functions.invoke('qcm-generator', {
      body: {
        item_code: itemCode,
        session_type: sessionType,
        question_count: questionCount
      }
    });

    if (error) {
      console.error('Error generating QCM:', error);
      throw new Error('Erreur lors de la génération du QCM');
    }

    return data;
  }

  async startQcmSession(
    itemCode: string,
    sessionType: 'rang_a' | 'rang_b' | 'mixed',
    questions: QcmQuestion[]
  ): Promise<{ success: boolean; session_id: string; questions: QcmQuestion[] }> {
    const { data, error } = await supabase.functions.invoke('qcm-generator', {
      body: {
        item_code: itemCode,
        session_type: sessionType,
        questions
      }
    });

    if (error) {
      console.error('Error starting QCM session:', error);
      throw new Error('Erreur lors du démarrage de la session QCM');
    }

    return data;
  }

  async submitResponse(
    sessionId: string,
    questionId: string,
    questionText: string,
    userAnswer: string,
    correctAnswer: string,
    responseTime: number,
    explanation?: string,
    medicalConcept?: string
  ): Promise<{ success: boolean; is_correct: boolean; explanation: string }> {
    const { data, error } = await supabase.functions.invoke('qcm-generator', {
      body: {
        session_id: sessionId,
        question_id: questionId,
        question_text: questionText,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        response_time: responseTime,
        explanation,
        medical_concept: medicalConcept
      }
    });

    if (error) {
      console.error('Error submitting QCM response:', error);
      throw new Error('Erreur lors de la soumission de la réponse');
    }

    return data;
  }

  async completeSession(sessionId: string): Promise<{
    success: boolean;
    session: QcmSession;
    score: number;
    correct_answers: number;
    incorrect_answers: number;
    total_questions: number;
    incorrect_responses: QcmResponse[];
    can_generate_error_song: boolean;
  }> {
    const { data, error } = await supabase.functions.invoke('qcm-generator', {
      body: { session_id: sessionId }
    });

    if (error) {
      console.error('Error completing QCM session:', error);
      throw new Error('Erreur lors de la finalisation de la session');
    }

    return data;
  }

  async generateErrorSong(
    sessionId: string,
    incorrectResponses: QcmResponse[]
  ): Promise<{
    success: boolean;
    error_song: ErrorSong;
    song_data: any;
  }> {
    const { data, error } = await supabase.functions.invoke('qcm-generator', {
      body: {
        session_id: sessionId,
        incorrect_responses: incorrectResponses
      }
    });

    if (error) {
      console.error('Error generating error song:', error);
      throw new Error('Erreur lors de la génération de la chanson d\'erreurs');
    }

    return data;
  }

  async getUserQcmHistory(): Promise<{ success: boolean; sessions: QcmSession[] }> {
    const { data, error } = await supabase.functions.invoke('qcm-generator', {
      body: null,
      method: 'GET'
    });

    if (error) {
      console.error('Error fetching QCM history:', error);
      throw new Error('Erreur lors de la récupération de l\'historique QCM');
    }

    return data;
  }

  async getUserQuotas(): Promise<UserQuota | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('user_quotas')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching quotas:', error);
        return null;
      }

      return data as UserQuota;
    } catch (error) {
      console.error('Error in getUserQuotas:', error);
      return null;
    }
  }

  async createDefaultQuotas(): Promise<UserQuota> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_quotas')
      .insert({
        user_id: user.user.id,
        subscription_type: 'standard',
        monthly_music_quota: 10,
        monthly_qcm_quota: 50,
        monthly_chat_quota: 100
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating default quotas:', error);
      throw new Error('Erreur lors de la création des quotas');
    }

    return data as UserQuota;
  }

  // Utility functions
  calculateSessionStats(sessions: QcmSession[]) {
    if (!sessions.length) return null;

    const completedSessions = sessions.filter(s => s.completed_at);
    const totalScore = completedSessions.reduce((sum, s) => sum + s.score, 0);
    const averageScore = totalScore / completedSessions.length;
    
    const sessionsByType = {
      rang_a: completedSessions.filter(s => s.session_type === 'rang_a').length,
      rang_b: completedSessions.filter(s => s.session_type === 'rang_b').length,
      mixed: completedSessions.filter(s => s.session_type === 'mixed').length
    };

    return {
      total_sessions: sessions.length,
      completed_sessions: completedSessions.length,
      average_score: Math.round(averageScore * 100) / 100,
      best_score: Math.max(...completedSessions.map(s => s.score)),
      sessions_by_type: sessionsByType,
      total_questions_answered: completedSessions.reduce((sum, s) => sum + s.total_questions, 0),
      total_correct_answers: completedSessions.reduce((sum, s) => sum + s.correct_answers, 0)
    };
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  }

  getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  }

  formatSessionDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getPerformanceMessage(score: number): string {
    if (score >= 90) return 'Excellent ! Performance remarquable 🏆';
    if (score >= 80) return 'Très bien ! Bonnes connaissances 👍';
    if (score >= 70) return 'Bien ! Quelques points à améliorer 📚';
    if (score >= 60) return 'Moyen, continuez à réviser 💪';
    return 'À revoir, recommandé de réviser le cours 📖';
  }
}

export const qcmService = new QcmService();