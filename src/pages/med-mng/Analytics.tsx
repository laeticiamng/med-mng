import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/80 to-background">
      <div className="container mx-auto space-y-8 px-4 py-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">Insights plateforme</h1>
          <p className="max-w-3xl text-base text-muted-foreground">
            Suivez en temps réel les interactions clés de med-mng : orchestration musicale, karaoké, progression EDN et
            séances 8 minutes. Toutes les métriques proviennent du schéma canonique Supabase avec opt-in utilisateur,
            pseudonymisation et purge automatique.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-medium">
              Confidentialité & couverture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>
              Seuls les utilisateurs ayant consenti à l&apos;instrumentation partagent des événements. Les identifiants sont
              pseudonymisés et chaque session dispose d&apos;un UUID distinct pour limiter toute ré-identification.
            </p>
            <p>
              Les événements expirent automatiquement selon la durée configurée dans les préférences (minimum 30 jours) et
              peuvent être purgés à tout moment via le centre de confidentialité.
            </p>
          </CardContent>
        </Card>

        <AdvancedAnalyticsDashboard />
      </div>
    </div>
  );
}
