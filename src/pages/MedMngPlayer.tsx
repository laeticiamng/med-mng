import { Play } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';

const MedMngPlayer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center">
      <PremiumCard className="p-8 text-center">
        <Play className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lecteur Musical</h1>
        <p className="text-gray-600">Fonctionnalité en développement</p>
      </PremiumCard>
    </div>
  );
};

export default MedMngPlayer;