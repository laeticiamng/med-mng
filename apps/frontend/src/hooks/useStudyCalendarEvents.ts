import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import logger from '@/lib/logger';

export type CalendarEventType =
  | 'study_session'
  | 'focus_session'
  | 'quiz'
  | 'challenge'
  | 'milestone'
  | 'deadline';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color?: string;
  metadata?: Record<string, any>;
}

interface UseCalendarEventsOptions {
  startDate?: Date;
  endDate?: Date;
  types?: CalendarEventType[];
}

const eventTypeColors: Record<CalendarEventType, string> = {
  study_session: '#3b82f6', // blue
  focus_session: '#8b5cf6', // purple
  quiz: '#f59e0b', // amber
  challenge: '#ef4444', // red
  milestone: '#22c55e', // green
  deadline: '#f97316', // orange
};

export const useStudyCalendarEvents = (options: UseCalendarEventsOptions = {}) => {
  const { user } = useAuth();

  // Default to current month with buffer
  const defaultStart = startOfWeek(startOfMonth(subMonths(new Date(), 1)));
  const defaultEnd = endOfWeek(endOfMonth(addMonths(new Date(), 1)));

  const startDate = options.startDate || defaultStart;
  const endDate = options.endDate || defaultEnd;
  const types = options.types;

  return useQuery({
    queryKey: ['calendar-events', user?.id, startDate.toISOString(), endDate.toISOString(), types],
    queryFn: async (): Promise<CalendarEvent[]> => {
      if (!user) return [];

      const events: CalendarEvent[] = [];

      try {
        // Fetch study sessions
        if (!types || types.includes('study_session')) {
          const { data: studySessions, error: studyError } = await (supabase as any)
            .from('study_sessions')
            .select('*')
            .eq('user_id', user.id)
            .or(
              `scheduled_at.gte.${startDate.toISOString()},started_at.gte.${startDate.toISOString()}`
            )
            .or(
              `scheduled_at.lte.${endDate.toISOString()},completed_at.lte.${endDate.toISOString()}`
            );

          if (!studyError && studySessions) {
            studySessions.forEach((session: any) => {
              const start = new Date(session.scheduled_at || session.started_at || session.created_at);
              const end = session.completed_at
                ? new Date(session.completed_at)
                : new Date(start.getTime() + session.duration_minutes * 60000);

              events.push({
                id: `study-${session.id}`,
                title: session.title,
                description: session.description,
                type: 'study_session',
                start,
                end,
                color: eventTypeColors.study_session,
                metadata: {
                  status: session.status,
                  topic: session.topic,
                  duration_minutes: session.duration_minutes,
                  item_numbers: session.item_numbers,
                },
              });
            });
          }
        }

        // Fetch focus sessions (Pomodoro)
        if (!types || types.includes('focus_session')) {
          const { data: focusSessions, error: focusError } = await (supabase as any)
            .from('focus_sessions')
            .select('*')
            .eq('user_id', user.id)
            .gte('started_at', startDate.toISOString())
            .lte('started_at', endDate.toISOString());

          if (!focusError && focusSessions) {
            focusSessions.forEach((session: any) => {
              const start = new Date(session.started_at);
              const end = session.ended_at
                ? new Date(session.ended_at)
                : new Date(start.getTime() + (session.duration_minutes || 25) * 60000);

              events.push({
                id: `focus-${session.id}`,
                title: session.topic || 'Session Pomodoro',
                type: 'focus_session',
                start,
                end,
                color: eventTypeColors.focus_session,
                metadata: {
                  session_type: session.session_type,
                  completed: session.completed,
                  duration_minutes: session.duration_minutes,
                },
              });
            });
          }
        }

        // Fetch quiz results as events
        if (!types || types.includes('quiz')) {
          const { data: quizResults, error: quizError } = await (supabase as any)
            .from('quiz_results')
            .select('*, quiz:quizzes(title, speciality)')
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

          if (!quizError && quizResults) {
            quizResults.forEach((result: any) => {
              const start = new Date(result.created_at);

              events.push({
                id: `quiz-${result.id}`,
                title: result.quiz?.title || 'Quiz',
                description: `Score: ${result.score}/${result.total_questions}`,
                type: 'quiz',
                start,
                allDay: false,
                color: eventTypeColors.quiz,
                metadata: {
                  score: result.score,
                  total_questions: result.total_questions,
                  speciality: result.quiz?.speciality,
                  quiz_id: result.quiz_id,
                },
              });
            });
          }
        }

        // Fetch challenges
        if (!types || types.includes('challenge')) {
          const { data: challenges, error: challengeError } = await (supabase as any)
            .from('challenges')
            .select('*')
            .or(`start_date.lte.${endDate.toISOString()},end_date.gte.${startDate.toISOString()}`);

          if (!challengeError && challenges) {
            challenges.forEach((challenge: any) => {
              events.push({
                id: `challenge-${challenge.id}`,
                title: challenge.title,
                description: challenge.description,
                type: 'challenge',
                start: new Date(challenge.start_date),
                end: new Date(challenge.end_date),
                allDay: true,
                color: eventTypeColors.challenge,
                metadata: {
                  reward_xp: challenge.reward_xp,
                  participants: challenge.participants_count,
                },
              });
            });
          }
        }

        // Fetch user goals with deadlines
        if (!types || types.includes('deadline')) {
          const { data: goals, error: goalsError } = await (supabase as any)
            .from('user_goals')
            .select('*')
            .eq('user_id', user.id)
            .not('deadline', 'is', null)
            .gte('deadline', startDate.toISOString())
            .lte('deadline', endDate.toISOString());

          if (!goalsError && goals) {
            goals.forEach((goal: any) => {
              events.push({
                id: `goal-${goal.id}`,
                title: goal.title,
                description: goal.description,
                type: 'deadline',
                start: new Date(goal.deadline),
                allDay: true,
                color: eventTypeColors.deadline,
                metadata: {
                  progress: goal.progress,
                  target: goal.target,
                  completed: goal.completed,
                },
              });
            });
          }
        }

        // Fetch milestones achieved
        if (!types || types.includes('milestone')) {
          const { data: milestones, error: milestonesError } = await (supabase as any)
            .from('goal_achievements')
            .select('*')
            .eq('user_id', user.id)
            .gte('achieved_at', startDate.toISOString())
            .lte('achieved_at', endDate.toISOString());

          if (!milestonesError && milestones) {
            milestones.forEach((milestone: any) => {
              events.push({
                id: `milestone-${milestone.id}`,
                title: milestone.achievement_name || 'Objectif atteint',
                type: 'milestone',
                start: new Date(milestone.achieved_at),
                allDay: false,
                color: eventTypeColors.milestone,
                metadata: {
                  xp_earned: milestone.xp_earned,
                },
              });
            });
          }
        }

        // Sort by start date
        events.sort((a, b) => a.start.getTime() - b.start.getTime());

        return events;
      } catch (error) {
        logger.error('Error fetching calendar events:', error);
        return events;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get events for a specific day
export const useDayEvents = (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return useStudyCalendarEvents({
    startDate: startOfDay,
    endDate: endOfDay,
  });
};

// Get events for the current week
export const useWeekEvents = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });

  return useStudyCalendarEvents({
    startDate: start,
    endDate: end,
  });
};

// Get events for the current month
export const useMonthEvents = (date?: Date) => {
  const targetDate = date || new Date();
  const start = startOfMonth(targetDate);
  const end = endOfMonth(targetDate);

  return useStudyCalendarEvents({
    startDate: start,
    endDate: end,
  });
};

// Get upcoming events
export const useUpcomingEvents = (limit = 10) => {
  const { user } = useAuth();
  const now = new Date();
  const futureDate = addMonths(now, 3);

  const { data: events, ...rest } = useStudyCalendarEvents({
    startDate: now,
    endDate: futureDate,
  });

  return {
    ...rest,
    data: events?.slice(0, limit),
  };
};

// Calendar statistics
export const useCalendarStats = () => {
  const { data: events, isLoading } = useMonthEvents();

  const stats = {
    totalEvents: events?.length || 0,
    studySessions: events?.filter((e) => e.type === 'study_session').length || 0,
    focusSessions: events?.filter((e) => e.type === 'focus_session').length || 0,
    quizzesTaken: events?.filter((e) => e.type === 'quiz').length || 0,
    milestonesAchieved: events?.filter((e) => e.type === 'milestone').length || 0,
    upcomingDeadlines: events?.filter(
      (e) => e.type === 'deadline' && e.start > new Date()
    ).length || 0,
  };

  return { stats, isLoading };
};

export default {
  useStudyCalendarEvents,
  useDayEvents,
  useWeekEvents,
  useMonthEvents,
  useUpcomingEvents,
  useCalendarStats,
};
