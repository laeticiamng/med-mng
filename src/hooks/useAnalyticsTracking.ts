// Hook for unified analytics tracking across the application
import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  trackPageView, 
  trackEvent, 
  trackEngagement, 
  trackFeatureUsage, 
  trackLearningProgress,
  trackPerformance 
} from '@/lib/analytics';

interface UseAnalyticsTrackingOptions {
  trackPageViews?: boolean;
  trackEngagementTime?: boolean;
}

export function useAnalyticsTracking(options: UseAnalyticsTrackingOptions = {}) {
  const { trackPageViews = true, trackEngagementTime = true } = options;
  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string>(location.pathname);

  // Track page views on route change
  useEffect(() => {
    if (trackPageViews) {
      trackPageView(location.pathname, document.title);
    }

    // Track time spent on previous page
    if (trackEngagementTime && lastPathRef.current !== location.pathname) {
      const timeSpent = Date.now() - startTimeRef.current;
      if (timeSpent > 1000) { // Only track if > 1 second
        trackPerformance('page_engagement_time', timeSpent, 'ms');
        trackEngagement('study', timeSpent, { page: lastPathRef.current });
      }
      startTimeRef.current = Date.now();
      lastPathRef.current = location.pathname;
    }
  }, [location.pathname, trackPageViews, trackEngagementTime]);

  // Track study session
  const trackStudySession = useCallback((
    itemCode: string,
    action: 'start' | 'pause' | 'complete',
    duration?: number
  ) => {
    trackEvent('study_session', {
      item_code: itemCode,
      action,
      duration_seconds: duration
    });
    
    if (action === 'complete' && duration) {
      trackEngagement('study', duration * 1000, { itemCode });
    }
  }, []);

  // Track quiz/exam activity
  const trackQuizActivity = useCallback((
    quizType: string,
    action: 'start' | 'answer' | 'complete',
    score?: number,
    totalQuestions?: number
  ) => {
    trackEvent('quiz_activity', {
      quiz_type: quizType,
      action,
      score,
      total_questions: totalQuestions
    });

    if (action === 'complete') {
      trackFeatureUsage('exam_mode', 'complete', { quizType, score });
      if (score !== undefined) {
        trackLearningProgress(quizType, score >= 80 ? 'mastered' : 'completed', score);
      }
    }
  }, []);

  // Track music generation
  const trackMusicGeneration = useCallback((
    itemCode: string,
    rang: 'A' | 'B',
    style: string,
    action: 'start' | 'complete' | 'error'
  ) => {
    trackEvent('music_generation', {
      item_code: itemCode,
      rang,
      style,
      action
    });
    trackFeatureUsage('paroles_musicales', action, { itemCode, rang, style });
  }, []);

  // Track AI interaction
  const trackAIInteraction = useCallback((
    action: 'question' | 'response' | 'feedback',
    context?: string,
    responseTime?: number
  ) => {
    trackEvent('ai_interaction', {
      action,
      context,
      response_time_ms: responseTime
    });
    
    if (action === 'question') {
      trackEngagement('ai_chat', responseTime, { context });
    }
  }, []);

  // Track clinical case progress
  const trackClinicalCase = useCallback((
    caseId: string,
    action: 'start' | 'step_complete' | 'complete',
    stepNumber?: number,
    score?: number
  ) => {
    trackEvent('clinical_case', {
      case_id: caseId,
      action,
      step_number: stepNumber,
      score
    });

    if (action === 'complete') {
      trackFeatureUsage('clinical_cases', 'complete', { caseId, score });
    }
  }, []);

  // Track flashcard review
  const trackFlashcardReview = useCallback((
    deckId: string,
    cardsReviewed: number,
    correctCount: number,
    duration: number
  ) => {
    trackEvent('flashcard_review', {
      deck_id: deckId,
      cards_reviewed: cardsReviewed,
      correct_count: correctCount,
      accuracy: cardsReviewed > 0 ? (correctCount / cardsReviewed) * 100 : 0,
      duration_seconds: duration
    });
    trackEngagement('review', duration * 1000, { deckId, cardsReviewed });
  }, []);

  // Track gamification events
  const trackGamificationEvent = useCallback((
    eventType: 'badge_unlock' | 'level_up' | 'streak_milestone' | 'challenge_complete',
    details: Record<string, any>
  ) => {
    trackEvent('gamification', {
      event_type: eventType,
      ...details
    });
  }, []);

  // Track community engagement
  const trackCommunityAction = useCallback((
    action: 'post_create' | 'comment' | 'like' | 'share' | 'message',
    targetId?: string
  ) => {
    trackEvent('community_action', {
      action,
      target_id: targetId
    });
    trackEngagement('community', undefined, { action, targetId });
  }, []);

  return {
    trackStudySession,
    trackQuizActivity,
    trackMusicGeneration,
    trackAIInteraction,
    trackClinicalCase,
    trackFlashcardReview,
    trackGamificationEvent,
    trackCommunityAction
  };
}
