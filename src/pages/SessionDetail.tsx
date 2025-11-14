import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SessionDetail() {
  const { sessionId } = useParams();
  return (
    <>
      <Helmet><title>Détail Session | Med-Mng</title></Helmet>
      <div className="container mx-auto px-4 py-8">
        <Link to={ROUTE_PATHS.sessions}><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button></Link>
        <Card>
          <CardHeader><CardTitle>Session {sessionId}</CardTitle></CardHeader>
          <CardContent><div className="space-y-4"><div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Durée: 45 minutes</span></div><div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>Date: {new Date().toLocaleDateString('fr-FR')}</span></div></div></CardContent>
        </Card>
      </div>
    </>
  );
}
