import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UXEnhancements } from './UXEnhancements';
import { PerformanceOptimizer } from './PerformanceOptimizer';
import { SmartLoadingStates } from './SmartLoadingStates';
import { 
  Accessibility, Gauge, TrendingUp, Heart, CheckCircle, Monitor, Smartphone, Tablet
} from 'lucide-react';

export const UXDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  
  const uxMetrics = { accessibility: 98, performance: 94, mobile: 96 };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Dashboard UX</h1>
          <p className="text-muted-foreground">Optimisation complète de l'expérience utilisateur</p>
        </div>

        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibilité</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Score UX Global
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-success mb-2">96%</div>
                  <Badge className="bg-success/20 text-success">Excellente UX</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility">
            <UXEnhancements />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceOptimizer />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};