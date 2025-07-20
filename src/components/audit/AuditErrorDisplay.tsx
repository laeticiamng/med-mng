
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

interface AuditErrorDisplayProps {
  error: string;
}

export const AuditErrorDisplay = ({ error }: AuditErrorDisplayProps) => {
  return (
    <Card className="mb-8 border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-red-800">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">Erreur d'audit</span>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
      </CardContent>
    </Card>
  );
};
