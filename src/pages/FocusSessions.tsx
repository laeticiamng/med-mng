import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Target, ArrowLeft, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

export default function FocusSessions() {
  const { user } = useAuth();
  const { data: sessions } = useQuery({
    queryKey: ['focus-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from('focus_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  return (
    <>
      <Helmet><title>Sessions de Focus | Med-Mng</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <Link to={ROUTE_PATHS.sessions}><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button></Link>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><Target className="w-8 h-8 text-purple-600" /><h1 className="text-3xl font-bold">Sessions de Focus</h1></div>
          <Button><Plus className="w-4 h-4 mr-2" />Démarrer Focus</Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Sessions Focus - Timer Pomodoro</CardTitle></CardHeader>
          <CardContent><div className="text-center py-12"><p className="text-muted-foreground">Total: {sessions?.length || 0} sessions</p></div></CardContent>
        </Card>
      </div>
    </>
  );
}
