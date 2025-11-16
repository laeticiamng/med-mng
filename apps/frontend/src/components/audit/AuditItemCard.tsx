
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { AuditResult } from '@/scripts/audit/types';

interface AuditItemCardProps {
  item: AuditResult;
}

export const AuditItemCard = ({ item }: AuditItemCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'invalid':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
          
          <p className="text-sm text-gray-600 mb-3">
            Slug: {item.slug}
          </p>

          {/* Complétude */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div className="flex items-center gap-2">
              {item.completeness.rangA ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Rang A</span>
            </div>
            <div className="flex items-center gap-2">
              {item.completeness.rangB ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Rang B</span>
            </div>
            <div className="flex items-center gap-2">
              {item.completeness.parolesMusicales ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-sm">Paroles</span>
            </div>
            <div className="flex items-center gap-2">
              {item.completeness.generationConfig ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-sm">Config</span>
            </div>
          </div>

          {/* Erreurs */}
          {item.errors.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-red-800 mb-1">Erreurs:</p>
              <ul className="text-sm text-red-700 space-y-1">
                {item.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Avertissements */}
          {item.warnings.length > 0 && (
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-1">Avertissements:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {item.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
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
