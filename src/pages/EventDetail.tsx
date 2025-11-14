import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EventDetail() {
  return (
    <>
      <Helmet><title>Détail Événement | Med-Mng</title></Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold text-gray-900 mb-4">Détail Événement</h1>
          <Card><CardHeader><CardTitle>En développement</CardTitle></CardHeader>
            <CardContent><p className="text-gray-600">Cette page est en cours de développement.</p>
              <Button className="mt-4">Explorer les fonctionnalités</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
