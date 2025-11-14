import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowLeft, Target, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function QuestDetail() {
  const { questId } = useParams();
  return (
    <>
      <Helmet><title>Détail Quête | Med-Mng</title></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to={ROUTE_PATHS.quests}><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button></Link>
        <Card>
          <CardHeader><CardTitle className="text-3xl">Quête Épique</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-6"><div><div className="text-sm text-muted-foreground mb-2">Progression</div><Progress value={65} className="h-3" /><div className="text-right text-sm mt-1">65%</div></div><div className="flex gap-4"><Button>Continuer</Button><Button variant="outline">Abandonner</Button></div></div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
