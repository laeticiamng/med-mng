import { useNavigate } from 'react-router-dom';
import { Music, ArrowLeft, User } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
import { AppFooter } from '@/components/AppFooter';

const MedMngCreate = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <PremiumButton
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </PremiumButton>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">MED MNG</h1>
                  <p className="text-sm text-gray-600">Générateur musical médical</p>
                </div>
              </div>
            </div>
            
            <PremiumButton
              variant="secondary"
              size="sm"
              onClick={() => navigate('/med-mng/login')}
            >
              <User className="w-4 h-4 mr-2" />
              Connexion
            </PremiumButton>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Music className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            MED MNG
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Transformez vos connaissances médicales en compositions musicales mémorables avec notre IA spécialisée.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <PremiumCard className="text-center">
              <div className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Music className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">IA Musicale</h3>
                <p className="text-gray-600">
                  Intelligence artificielle spécialisée dans la création musicale pour l'apprentissage médical.
                </p>
              </div>
            </PremiumCard>

            <PremiumCard className="text-center">
              <div className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Music className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Styles Variés</h3>
                <p className="text-gray-600">
                  Choisissez parmi différents styles musicaux adaptés à votre apprentissage.
                </p>
              </div>
            </PremiumCard>

            <PremiumCard className="text-center">
              <div className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Music className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Mémorisation</h3>
                <p className="text-gray-600">
                  Améliorez votre rétention des informations médicales grâce à la musique.
                </p>
              </div>
            </PremiumCard>
          </div>

          <div className="space-y-4">
            <PremiumButton
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              onClick={() => navigate('/med-mng/login')}
            >
              <User className="w-5 h-5 mr-2" />
              Se connecter pour commencer
            </PremiumButton>
            
            <p className="text-sm text-gray-500">
              Connectez-vous pour accéder au générateur musical complet
            </p>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default MedMngCreate;