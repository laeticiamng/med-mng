import { AppFooter } from "@/components/AppFooter";
import { PremiumBackground } from "@/components/ui/premium-background";
import { PremiumCard } from "@/components/ui/premium-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { useNavigate } from "react-router-dom";
import { LogIn, CreditCard, BarChart3, Music, Brain, Settings, Sparkles, Star } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";
import { Badge } from "@/components/ui/badge";
import { SystemHealthCheck } from "@/components/SystemHealthCheck";

const Index = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  return (
    <PremiumBackground>
      <div className="min-h-screen">
        <SystemHealthCheck />
        
        <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-2xl">MED MNG</span>
              </div>
              
              <div className="flex items-center gap-4">
                <PremiumButton variant="secondary" size="sm" onClick={() => navigate('/subscription')}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  <TranslatedText text="Premium" />
                </PremiumButton>
                
                <PremiumButton variant="primary" size="sm" onClick={() => navigate('/med-mng/login')}>
                  <LogIn className="h-4 w-4 mr-2" />
                  <TranslatedText text="Connexion" />
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pt-16 pb-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Écosystème Médical Intelligent
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Suite complète d'outils médicaux alimentés par l'IA
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <PremiumCard className="cursor-pointer" onClick={() => navigate('/edn-complete')}>
              <div className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Base EDN Complète</h3>
                <p className="text-gray-600">367 items EDN avec 4,872 compétences OIC</p>
              </div>
            </PremiumCard>

            <PremiumCard className="cursor-pointer" onClick={() => navigate('/med-mng')}>
              <div className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mb-6">
                  <Music className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">MED MNG</h3>
                <p className="text-gray-600">Générateur musical médical avec IA Suno</p>
              </div>
            </PremiumCard>
          </div>
        </div>

        <AppFooter />
      </div>

      {isAdmin && (
        <div className="fixed bottom-6 right-6">
          <PremiumButton variant="secondary" size="sm" onClick={() => navigate('/admin/audit')}>
            <Settings className="h-4 w-4 mr-2" />
            Audit
          </PremiumButton>
        </div>
      )}
    </PremiumBackground>
  );
};

export default Index;