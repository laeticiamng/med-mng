import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReportViewer() {
  // ✅ SÉCURITÉ: Vérification admin requise
  const { user } = useAuth();
  const { isAdmin, loadingMyRoles } = useUserRoles();

  if (!user) {
    return <Navigate to="/med-mng-login" replace />;
  }

  if (!loadingMyRoles && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet><title>Visualiseur de Rapport | Med-Mng</title></Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold text-gray-900 mb-4">Visualiseur de Rapport</h1>
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
