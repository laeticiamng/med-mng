import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/config/routes';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Clock, History, Play } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LastSession {
  type: 'item' | 'ecos' | 'flashcard' | 'exam';
  title: string;
  route: string;
  timestamp: Date;
  progress?: number;
}

export const ContinueWhereYouLeft: React.FC = () => {
  const [lastSession, setLastSession] = useState<LastSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const homeRoute: string = ROUTE_PATHS.home;

  useEffect(() => {
    const fetchLastSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch the most recent activity
        const { data: activities } = await supabase
          .from('user_activity_log')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (activities && activities.length > 0) {
          const activity = activities[0];
          const metadata = activity.metadata as Record<string, any> || {};
          
          // Map activity type to route
          let route: string = ROUTE_PATHS.home as string;
          let type: LastSession['type'] = 'item';
          let title = 'Continuer votre session';

          if (activity.activity_type === 'music' || metadata?.item_code) {
            route = `${ROUTE_PATHS.ednComplete}/${metadata?.item_code || ''}`;
            title = `Item ${metadata?.item_code || 'EDN'}`;
            type = 'item';
          } else if (activity.activity_type === 'study' && metadata?.type === 'ecos') {
            route = ROUTE_PATHS.ecosIndex as string;
            title = 'Simulation ECOS';
            type = 'ecos';
          } else if (activity.activity_type === 'study' && metadata?.type === 'flashcard') {
            route = ROUTE_PATHS.flashcards as string;
            title = 'Révision Flashcards';
            type = 'flashcard';
          } else if (activity.activity_type === 'study' && metadata?.type === 'exam') {
            route = ROUTE_PATHS.examMode as string;
            title = 'Mode Examen';
            type = 'exam';
          }

          setLastSession({
            type,
            title,
            route,
            timestamp: new Date(activity.created_at),
            progress: metadata?.progress || undefined
          });
        }
      } catch (error) {
        console.error('Error fetching last session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLastSession();
  }, []);

  // Don't show if loading or no session
  if (isLoading || !lastSession) {
    return null;
  }

  const timeAgo = getTimeAgo(lastSession.timestamp);

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20 hover:border-primary/40 transition-all duration-300 group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <History className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Reprendre
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
        <CardTitle className="text-lg mt-2">{lastSession.title}</CardTitle>
        <CardDescription>
          Continuez là où vous en étiez
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lastSession.progress && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progression</span>
              <span>{lastSession.progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${lastSession.progress}%` }}
              />
            </div>
          </div>
        )}
        <Button 
          onClick={() => navigate(lastSession.route)}
          className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
          variant="outline"
        >
          <Play className="h-4 w-4" />
          Continuer
          <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default ContinueWhereYouLeft;
