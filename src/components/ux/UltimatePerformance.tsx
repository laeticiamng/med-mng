import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, CheckCircle } from 'lucide-react';

export const UltimatePerformance: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Performance Score</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>First Contentful Paint</span>
              <span className="text-green-600">0.8s</span>
            </div>
            <Progress value={95} className="h-2" />
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Excellent</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};