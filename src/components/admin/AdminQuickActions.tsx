import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Database, Shield, BarChart3, Search } from 'lucide-react';

interface QuickActionsProps {
  onExecuteAction: (action: string) => Promise<void>;
  isRefreshing: boolean;
}

export const AdminQuickActions: React.FC<QuickActionsProps> = ({ 
  onExecuteAction, 
  isRefreshing 
}) => {
  const quickActions = [
    {
      id: 'sync_uness',
      label: 'Synchroniser données UNESS',
      icon: Database,
      description: 'Synchronisation complète des données UNESS'
    },
    {
      id: 'security_audit',
      label: 'Lancer audit sécurité',
      icon: Shield,
      description: 'Vérification complète de la sécurité'
    },
    {
      id: 'analytics_report',
      label: 'Générer rapport analytics',
      icon: BarChart3,
      description: 'Rapport détaillé des analytics'
    },
    {
      id: 'data_integrity',
      label: 'Vérification intégrité données',
      icon: Search,
      description: 'Contrôle de l\'intégrité des données'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Actions rapides
        </CardTitle>
        <CardDescription>
          Outils de gestion rapide du système
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action) => (
          <Button 
            key={action.id}
            className="w-full justify-start" 
            variant="outline"
            onClick={() => onExecuteAction(action.id)}
            disabled={isRefreshing}
          >
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};