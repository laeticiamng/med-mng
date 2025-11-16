import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { BookOpen, ArrowLeft, Plus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

export default function StudySessions() {
  const { user } = useAuth();
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['study-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from('study_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  return (
    <>
      <Helmet><title>Sessions d'Étude | Med-Mng</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <Link to={ROUTE_PATHS.sessions}><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button></Link>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><BookOpen className="w-8 h-8 text-blue-600" /><h1 className="text-3xl font-bold">Sessions d'Étude</h1></div>
          <Button><Plus className="w-4 h-4 mr-2" />Nouvelle Session</Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Historique des Sessions</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div><div className="font-semibold">Session du {new Date(session.created_at).toLocaleDateString('fr-FR')}</div><div className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" />{session.duration || 0} minutes</div></div>
                    <Link to={`${ROUTE_PATHS.sessions}/${session.id}`}><Button variant="outline" size="sm">Voir détails</Button></Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground"><p>Aucune session d'étude</p></div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
