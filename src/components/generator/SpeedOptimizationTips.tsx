import React from 'react';
import { Zap, Clock, TrendingUp } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';

export const SpeedOptimizationTips: React.FC = () => {
  return (
    <PremiumCard variant="glass" className="p-6 bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Optimisations de vitesse</h3>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Polling optimisé 5s</p>
            <p className="text-gray-600">Vérification toutes les 5 secondes au lieu de 8s</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Clock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Temps moyen : 30-90s</p>
            <p className="text-gray-600">Suno génère généralement en moins de 1 minute 30</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Zap className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Progression intelligente</p>
            <p className="text-gray-600">Indicateurs visuels pour réduire l'attente perçue</p>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
};