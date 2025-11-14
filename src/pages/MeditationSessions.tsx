import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Brain, ArrowLeft, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MeditationSessions() {
  return (
    <>
      <Helmet><title>Sessions de Méditation | Med-Mng</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <Link to={ROUTE_PATHS.sessions}><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button></Link>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><Brain className="w-8 h-8 text-green-600" /><h1 className="text-3xl font-bold">Méditation</h1></div>
          <Button><Play className="w-4 h-4 mr-2" />Commencer</Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Sessions Guidées</CardTitle></CardHeader>
          <CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[5, 10, 15].map(min => (<Card key={min} className="p-4"><div className="font-semibold">{min} minutes</div><Button size="sm" className="mt-2">Démarrer</Button></Card>))}</div></CardContent>
        </Card>
      </div>
    </>
  );
}
