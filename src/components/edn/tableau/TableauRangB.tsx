import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, AlertCircle } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface TableauRangBProps {
  data?: any;
  itemCode: string;
}

export const TableauRangB: React.FC<TableauRangBProps> = ({ data, itemCode }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>Compétences Rang B</CardTitle>
            <CardDescription>Compétences avancées</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            <TranslatedText text="Expertise Rang B en développement" />
          </h3>
          <Badge variant="secondary">{itemCode}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};