import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function QuestStart() {
  const { questId } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <Helmet><title>Démarrer Quête | Med-Mng</title></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader><div className="flex justify-center mb-4"><Target className="w-16 h-16 text-purple-600" /></div><CardTitle className="text-center text-2xl">Prêt à commencer?</CardTitle></CardHeader>
          <CardContent className="text-center"><p className="text-muted-foreground mb-6">Vous allez démarrer une nouvelle quête</p><div className="flex gap-4 justify-center"><Button onClick={() => navigate(`${ROUTE_PATHS.quests}/${questId}`)}>Commencer la Quête</Button><Button variant="outline" onClick={() => navigate(ROUTE_PATHS.quests)}>Annuler</Button></div></CardContent>
        </Card>
      </div>
    </>
  );
}
