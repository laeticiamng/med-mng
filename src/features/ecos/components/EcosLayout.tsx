// ECOS Feature Layout - Specialized layout for ECOS simulations
import React from "react";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, BookOpen } from "lucide-react";
import { t } from "@/lib/i18n/keys";

interface EcosLayoutProps {
  children: React.ReactNode;
  scenario?: {
    id: string;
    title: string;
    progress?: number;
    timeRemaining?: number;
    status: 'not_started' | 'in_progress' | 'completed';
  };
  showProgress?: boolean;
  showFilters?: boolean;
}

export function EcosLayout({ children, scenario, showProgress = false, showFilters = false }: EcosLayoutProps) {
  const sidebar = scenario ? (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium mb-2">{scenario.title}</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              {scenario.timeRemaining ? `${scenario.timeRemaining} min restantes` : 'Temps libre'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Simulation individuelle</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <Badge variant={
              scenario.status === 'completed' ? 'default' : 
              scenario.status === 'in_progress' ? 'secondary' : 'outline'
            }>
              {scenario.status === 'completed' ? 'Terminé' : 
               scenario.status === 'in_progress' ? 'En cours' : 'À commencer'}
            </Badge>
          </div>
        </div>
        
        {showProgress && scenario.progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progression</span>
              <span>{scenario.progress}%</span>
            </div>
            <Progress value={scenario.progress} className="h-2" />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Button variant="outline" size="sm" className="w-full justify-start">
          Aide & Consignes
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start">
          Historique
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start">
          Signaler un problème
        </Button>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium mb-2">{t('features.ecos.title')}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t('features.ecos.description')}
        </p>
        <Button className="w-full">
          {t('features.ecos.start')}
        </Button>
      </div>
    </div>
  );

  const actions = scenario ? (
    <div className="flex items-center gap-2">
      {scenario.status === 'in_progress' && (
        <Button variant="outline" size="sm">
          Pause
        </Button>
      )}
      <Button size="sm">
        {scenario.status === 'not_started' ? t('features.ecos.start') : 
         scenario.status === 'in_progress' ? t('features.ecos.continue') : 
         t('features.ecos.results')}
      </Button>
    </div>
  ) : null;

  return (
    <DashboardLayout
      title={scenario ? scenario.title : t('features.ecos.title')}
      subtitle={!scenario ? t('features.ecos.description') : undefined}
      actions={actions}
      sidebar={sidebar}
    >
      {children}
    </DashboardLayout>
  );
}