
import { Card, CardContent } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

interface AuditErrorDisplayProps {
  error: string;
}

export const AuditErrorDisplay = ({ error }: AuditErrorDisplayProps) => {
  return (
    <Card className="mb-8 border-destructive/20 bg-destructive/5">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">Erreur d'audit</span>
        </div>
        <p className="text-destructive/80 mt-2">{error}</p>
      </CardContent>
    </Card>
  );
};