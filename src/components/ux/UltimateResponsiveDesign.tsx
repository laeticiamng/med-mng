import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Tablet, Monitor, CheckCircle } from 'lucide-react';

export const UltimateResponsiveDesign: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Smartphone className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h3 className="font-semibold">Mobile First</h3>
            <Badge className="mt-2 bg-green-100 text-green-800">100% Optimisé</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Tablet className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <h3 className="font-semibold">Tablette</h3>
            <Badge className="mt-2 bg-green-100 text-green-800">Parfait</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Monitor className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="font-semibold">Desktop</h3>
            <Badge className="mt-2 bg-green-100 text-green-800">Fluide</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};