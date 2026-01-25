
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { AuditResult } from '@/scripts/audit/types';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AuditItemCardProps {
  item: AuditResult;
}

export const AuditItemCard = ({ item }: AuditItemCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-success/10 text-success border-success/20';
      case 'invalid':
        return 'bg-warning/10 text-warning-foreground border-warning/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {getStatusIcon(item.status)}
            <span className="font-medium text-lg">{item.item_code}</span>
            <Badge className={getStatusColor(item.status)}>
              {item.status}
            </Badge>
            <Badge variant="outline">
              {item.isV2Format ? 'v2' : 'v1'}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            Slug: {item.slug}
          </p>

          {/* Complétude */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div className="flex items-center gap-2">
              {item.completeness.rangA ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm">Rang A</span>
            </div>
            <div className="flex items-center gap-2">
              {item.completeness.rangB ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm">Rang B</span>
            </div>
            <div className="flex items-center gap-2">
              {item.completeness.parolesMusicales ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-warning" />
              )}
              <span className="text-sm">Paroles</span>
            </div>
            <div className="flex items-center gap-2">
              {item.completeness.generationConfig ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-warning" />
              )}
              <span className="text-sm">Config</span>
            </div>
          </div>

          {/* Erreurs */}
          {item.errors.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-destructive mb-1">Erreurs:</p>
              <ul className="text-sm text-destructive/80 space-y-1">
                {item.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Avertissements */}
          {item.warnings.length > 0 && (
            <div>
              <p className="text-sm font-medium text-warning-foreground mb-1">Avertissements:</p>
              <ul className="text-sm text-warning-foreground/80 space-y-1">
                {item.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-warning">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};