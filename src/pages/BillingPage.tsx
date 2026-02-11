import { BillingDashboard } from '@/components/billing/BillingDashboard';
import { MedicalDisclaimerFooter } from '@/components/legal';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/config/routes';
import { ChevronLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function BillingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Helmet>
        <title>Facturation & Abonnement | MED-MNG</title>
        <meta name="description" content="Gérez votre abonnement MED-MNG, consultez votre consommation et vos factures." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.medMngProfile)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Profil
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Facturation & Abonnement
            </h1>
            <p className="text-muted-foreground">Gérez votre plan et votre consommation</p>
          </div>
        </div>

        <BillingDashboard />

        <MedicalDisclaimerFooter className="mt-8" />
      </div>
    </div>
  );
}
