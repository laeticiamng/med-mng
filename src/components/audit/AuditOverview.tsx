
import { Card, CardContent } from '@/components/ui/card';
import type { AuditReport } from '@/scripts/audit/types';
import {
    AlertTriangle,
    BarChart3,
    CheckCircle,
    XCircle
} from 'lucide-react';

interface AuditOverviewProps {
  report: AuditReport;
}

export const AuditOverview = ({ report }: AuditOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{report.totalItems}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valides</p>
              <p className="text-2xl font-bold text-success">{report.validItems}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Invalides</p>
              <p className="text-2xl font-bold text-warning">{report.invalidItems}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-warning" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Erreurs</p>
              <p className="text-2xl font-bold text-destructive">{report.errorItems}</p>
            </div>
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
