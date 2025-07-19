import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
import { AppFooter } from '@/components/AppFooter';

const EdnIndex = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">EDN - Items de Connaissance</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explorez les 367 items EDN avec plus de 4,872 compétences OIC organisées par rang.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PremiumCard className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Base EDN Complète</h3>
              <p className="text-gray-600 mb-6">
                Accédez à tous les items EDN avec leurs compétences détaillées, organisés de manière immersive.
              </p>
              <PremiumButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/edn-complete')}
              >
                Explorer les items <ArrowRight className="w-5 h-5 ml-2" />
              </PremiumButton>
            </div>
          </PremiumCard>

          <PremiumCard className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Générateur Musical</h3>
              <p className="text-gray-600 mb-6">
                Créez des compositions musicales à partir des compétences EDN pour faciliter l'apprentissage.
              </p>
              <PremiumButton
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/generator')}
              >
                Créer de la musique <ArrowRight className="w-5 h-5 ml-2" />
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>

        <div className="text-center mt-12">
          <PremiumButton
            variant="outline"
            onClick={() => navigate('/')}
          >
            ← Retour à l'accueil
          </PremiumButton>
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default EdnIndex;