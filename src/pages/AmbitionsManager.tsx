import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Target, ArrowLeft, Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function AmbitionsManager() {
  const ambitions = [
    { title: 'Maîtriser l\'Anatomie', progress: 75, deadline: '2025-12-31' },
    { title: 'Compléter 50 Challenges', progress: 60, deadline: '2025-11-30' },
  ];

  return (
    <>
      <Helmet><title>Mes Ambitions | Med-Mng</title></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to={ROUTE_PATHS.quests}><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button></Link>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><TrendingUp className="w-8 h-8 text-blue-600" /><h1 className="text-3xl font-bold">Mes Ambitions</h1></div>
          <Button><Plus className="w-4 h-4 mr-2" />Nouvelle Ambition</Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Ambitions en Cours</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ambitions.map((amb, i) => (
                <Card key={i}>
                  <CardContent className="pt-6"><div className="flex items-start gap-4"><Target className="w-8 h-8 text-blue-600" /><div className="flex-1"><h3 className="font-semibold mb-2">{amb.title}</h3><Progress value={amb.progress} className="mb-2" /><div className="text-sm text-muted-foreground">Échéance: {amb.deadline}</div></div></div></CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
