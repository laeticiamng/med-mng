import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ProductionEdnProgression: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>EDN Progression</CardTitle>
        <CardDescription>Track your learning progress</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">EDN progression features coming soon...</p>
      </CardContent>
    </Card>
  );
};