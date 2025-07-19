import { useNavigate } from 'react-router-dom';
import { User, Music, LogOut } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';

const MedMngProfile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/med-mng/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-16">
        <PremiumCard className="max-w-2xl mx-auto">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profil MED MNG</h1>
            <p className="text-gray-600 mb-8">Bienvenue dans votre espace personnel</p>
            
            <div className="space-y-4">
              <PremiumButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/generator')}
              >
                <Music className="w-5 h-5 mr-2" />
                Créer de la musique
              </PremiumButton>
              
              <PremiumButton
                variant="outline"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
};

export default MedMngProfile;