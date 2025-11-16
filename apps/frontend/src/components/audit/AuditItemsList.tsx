
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditItemCard } from './AuditItemCard';
import type { AuditReport } from '@/scripts/audit/types';

interface AuditItemsListProps {
  report: AuditReport;
}

export const AuditItemsList = ({ report }: AuditItemsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Détail par Item</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tous ({report.totalItems})</TabsTrigger>
            <TabsTrigger value="valid">Valides ({report.validItems})</TabsTrigger>
            <TabsTrigger value="invalid">Invalides ({report.invalidItems})</TabsTrigger>
            <TabsTrigger value="error">Erreurs ({report.errorItems})</TabsTrigger>
          </TabsList>

          {['all', 'valid', 'invalid', 'error'].map(filter => (
            <TabsContent key={filter} value={filter} className="mt-6">
              <div className="space-y-4">
                {report.results
                  .filter(item => filter === 'all' || item.status === filter)
                  .map(item => (
                    <AuditItemCard key={item.id} item={item} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
