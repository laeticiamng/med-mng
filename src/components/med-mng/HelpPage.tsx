import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const HelpPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Centre d'aide</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Documentation et aide en développement</p>
        </CardContent>
      </Card>
    </div>
  );
};