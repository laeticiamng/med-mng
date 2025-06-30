
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3 } from 'lucide-react';
import type { AuditReport } from '@/scripts/audit/types';

interface AuditProgressProps {
  report: AuditReport;
}

export const AuditProgress = ({ report }: AuditProgressProps) => {
  const validationRate = Math.round((report.validItems / report.totalItems) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Taux de Conformité
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Validation Globale</span>
            <span className="text-sm text-gray-600">{validationRate}%</span>
          </div>
          <Progress value={validationRate} className="h-2" />
          <p className="text-xs text-gray-500">
            {report.validItems} items sur {report.totalItems} respectent le schéma v2
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
