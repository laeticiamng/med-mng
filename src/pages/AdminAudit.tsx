import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';

const AdminAudit = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <PremiumButton
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </PremiumButton>
        
        <PremiumCard className="text-center p-12">
          <Settings className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Administration</h1>
          <p className="text-gray-600 mb-6">Outils d'audit et de gestion système</p>
          <p className="text-gray-500">Accès administrateur requis</p>
        </PremiumCard>
      </div>
    </div>
  );
};

export default AdminAudit;