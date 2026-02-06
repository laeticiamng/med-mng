import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { PremiumBackground } from "@/components/ui/premium-background";
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';

const NotFound = () => {
  const location = useLocation();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404 Error:", location.pathname);
    }
    logActivity({ activity_type: 'study', metadata: { action: '404_error', path: location.pathname } });
  }, [location.pathname]);

  return (
    <PremiumBackground>
      <div className="min-h-screen flex items-center justify-center px-4">
        <PremiumCard variant="glass" className="text-center p-12 max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-5xl font-bold text-destructive">404</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Page introuvable
          </h1>
          <p className="text-muted-foreground mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Button asChild>
              <Link to={ROUTE_PATHS.home}>
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Link>
            </Button>
          </div>
        </PremiumCard>
      </div>
    </PremiumBackground>
  );
};

export default NotFound;