import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Sword, Target, Trophy, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function QuestsDashboard() {
  const { data: quests } = useQuery({
    queryKey: ['ambition-quests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ambition_quests').select('*').order('created_at', { ascending: false }).limit(12);
      if (error) throw error;
      return data;
    }
  });

  return (
    <>
      <Helmet><title>Quêtes | Med-Mng</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><Sword className="w-8 h-8 text-purple-600" /><h1 className="text-3xl font-bold">Quêtes & Ambitions</h1></div>
          <Link to={ROUTE_PATHS.ambitions}><Button>Mes Ambitions</Button></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card><CardHeader className="pb-3"><div className="text-sm text-muted-foreground">Quêtes Actives</div><div className="text-2xl font-bold">{quests?.length || 0}</div></CardHeader></Card>
          <Card><CardHeader className="pb-3"><div className="text-sm text-muted-foreground">Complétées</div><div className="text-2xl font-bold text-green-600">8</div></CardHeader></Card>
          <Card><CardHeader className="pb-3"><div className="text-sm text-muted-foreground">Points Gagnés</div><div className="text-2xl font-bold text-yellow-600">2,450</div></CardHeader></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Quêtes Disponibles</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quests?.map((quest) => (
                <Link key={quest.id} to={`${ROUTE_PATHS.quests}/${quest.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4"><Target className="w-8 h-8 text-purple-600" /><div className="flex-1"><h3 className="font-semibold mb-2">{quest.title || 'Quête'}</h3><Progress value={Math.random() * 100} className="mb-2" /><div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /><span className="text-sm">{quest.reward_points || 100} pts</span></div></div></div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
