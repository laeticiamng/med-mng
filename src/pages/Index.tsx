import { AppFooter } from "@/components/AppFooter";
import { PremiumBackground } from "@/components/ui/premium-background";
import { PremiumCard } from "@/components/ui/premium-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { useNavigate } from "react-router-dom";
import { LogIn, CreditCard, BarChart3, Music, BookOpen, MessageSquare, Users, Zap, Target, Award, TrendingUp, Sparkles, Star, Brain, Settings, CheckCircle } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";
import { useFreeTrialLimit } from '@/hooks/useFreeTrialLimit';
import { Badge } from "@/components/ui/badge";
import { SystemHealthCheck } from "@/components/SystemHealthCheck";

const Index = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const { getRemainingGenerations, maxFreeGenerations } = useFreeTrialLimit();
  const remainingFree = getRemainingGenerations();

  return (
    <PremiumBackground>
      <div className="min-h-screen">
        <SystemHealthCheck />
        
        <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl shadow-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    MED MNG
                  </span>
                  <div className="text-xs text-gray-500 font-medium">Plateforme Premium</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {remainingFree > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    {remainingFree}/{maxFreeGenerations} générations gratuites
                  </Badge>
                )}
                
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/subscription')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  <TranslatedText text="Premium" />
                </PremiumButton>
                
                <PremiumButton
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/med-mng/login')}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  <TranslatedText text="Connexion" />
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="pt-16 pb-20">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-8 border border-blue-200/50">
                <Star className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-semibold">Plateforme Médicale Intelligente</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Écosystème Médical
                </span>
                <br />
                <span className="text-gray-900">Intelligent</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Une suite complète d'outils médicaux alimentés par l'IA.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <PremiumCard
              className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/edn-complete')}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <Badge variant="secondary">EDN</Badge>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Base EDN Complète
                </h3>
                
                <p className="text-gray-600 mb-6">
                  367 items EDN avec 4,872 compétences OIC
                </p>
              </div>
            </PremiumCard>

            <PremiumCard
              className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/med-mng')}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <Music className="w-7 h-7 text-white" />
                  </div>
                  <Badge variant="secondary">Music</Badge>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  MED MNG
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Générateur musical médical avec IA Suno
                </p>
              </div>
            </PremiumCard>
          </div>
        </div>

        <AppFooter />
      </div>

      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <PremiumButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/audit')}
            className="shadow-lg"
          >
            <Settings className="h-4 w-4 mr-2" />
            <span className="font-semibold">Audit</span>
          </PremiumButton>
        </div>
      )}
    </PremiumBackground>
  );
};

export default Index;