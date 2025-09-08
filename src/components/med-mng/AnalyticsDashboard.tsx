import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tableau de bord analytique</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Fonctionnalité en développement</p>
        </CardContent>
      </Card>
    </div>
  );
};