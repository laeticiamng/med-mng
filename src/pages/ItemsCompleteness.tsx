import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemsCompletenessOverview } from '@/components/admin/ItemsCompletenessOverview';

export default function ItemsCompleteness() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Items Completeness</h1>
          <p className="text-muted-foreground">Monitor and manage item completion status</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completeness Overview</CardTitle>
          <CardDescription>Real-time monitoring of item completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <ItemsCompletenessOverview />
        </CardContent>
      </Card>
    </div>
  );
}