import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HealthCheckResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
}

export const SystemHealthCheck = () => {
  const [checks, setChecks] = useState<HealthCheckResult[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const runHealthChecks = async () => {
      const results: HealthCheckResult[] = [];

      // Check 1: Database Connection
      try {
        const { data, error } = await supabase.from('edn_items_complete').select('count').limit(1);
        if (error) throw error;
        results.push({
          name: 'Connexion Base de Données',
          status: 'success',
          message: 'Connecté à Supabase'
        });
      } catch (error) {
        results.push({
          name: 'Connexion Base de Données',
          status: 'error',
          message: 'Erreur de connexion'
        });
      }

      // Check 2: EDN Items Data
      try {
        const { data, error } = await supabase
          .from('edn_items_complete')
          .select('id')
          .limit(367);
        if (error) throw error;
        const count = data?.length || 0;
        results.push({
          name: 'Items EDN',
          status: count >= 367 ? 'success' : 'warning',
          message: `${count}/367 items disponibles`
        });
      } catch (error) {
        results.push({
          name: 'Items EDN',
          status: 'error',
          message: 'Erreur de récupération'
        });
      }

      // Check 3: OIC Competences
      try {
        const { data, error } = await supabase
          .from('oic_competences')
          .select('objectif_id')
          .limit(5000);
        if (error) throw error;
        const count = data?.length || 0;
        results.push({
          name: 'Compétences OIC',
          status: count >= 4000 ? 'success' : 'warning',
          message: `${count} compétences chargées`
        });
      } catch (error) {
        results.push({
          name: 'Compétences OIC',
          status: 'error',
          message: 'Erreur de récupération'
        });
      }

      // Check 4: ECOS Situations
      try {
        const { data, error } = await supabase
          .from('ecos_situations_complete')
          .select('id');
        if (error) throw error;
        const count = data?.length || 0;
        results.push({
          name: 'Situations ECOS',
          status: count >= 3 ? 'success' : 'warning',
          message: `${count} situations disponibles`
        });
      } catch (error) {
        results.push({
          name: 'Situations ECOS',
          status: 'error',
          message: 'Erreur de récupération'
        });
      }

      // Check 5: Authentication System
      try {
        const { data: { user } } = await supabase.auth.getUser();
        results.push({
          name: 'Système d\'Authentification',
          status: 'success',
          message: user ? `Connecté: ${user.email}` : 'Système opérationnel'
        });
      } catch (error) {
        results.push({
          name: 'Système d\'Authentification',
          status: 'error',
          message: 'Erreur d\'authentification'
        });
      }

      setChecks(results);
    };

    // Show only if admin or in development
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const isDev = import.meta.env.DEV;
    
    if (isAdmin || isDev) {
      setIsVisible(true);
      runHealthChecks();
    }
  }, []);

  if (!isVisible) return null;

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const allHealthy = checks.every(check => check.status === 'success');
  const hasErrors = checks.some(check => check.status === 'error');

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <div className="bg-white/95 backdrop-blur-sm border rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">État du Système</h3>
          <Badge 
            variant="secondary" 
            className={allHealthy ? 'bg-green-100 text-green-800' : hasErrors ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
          >
            {allHealthy ? 'Opérationnel' : hasErrors ? 'Erreurs détectées' : 'Avertissements'}
          </Badge>
        </div>
        
        <div className="space-y-2">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getIcon(check.status)}
                <span className="text-xs font-medium">{check.name}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(check.status)}`}>
                {check.message}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
          Dernière vérification: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};