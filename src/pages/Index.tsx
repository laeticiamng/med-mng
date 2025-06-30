
import { HeroSection } from "@/components/HeroSection";
import { MngPresentationBrief } from "@/components/MngPresentationBrief";
import { MainSections } from "@/components/MainSections";
import { MusicGenerationSection } from "@/components/MusicGenerationSection";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn, CreditCard, BarChart3 } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";

const Index = () => {
  const navigate = useNavigate();

  // Simple admin check - you can replace this with your actual admin logic
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      
      {/* Header amélioré avec navigation fixe */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
              <span className="font-bold text-xl text-gray-900">MED MNG</span>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/edn')}
                className="hidden sm:inline-flex text-gray-600 hover:text-gray-900"
              >
                <TranslatedText text="Générateur" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/med-mng/pricing')}
                className="flex items-center gap-2 bg-white/80 hover:bg-white shadow-sm"
              >
                <CreditCard className="h-4 w-4" />
                <TranslatedText text="Tarifs" />
              </Button>
              
              <Button
                onClick={() => navigate('/med-mng/login')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <LogIn className="h-4 w-4" />
                <TranslatedText text="Connexion" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec espacement amélioré */}
      <div className="container mx-auto px-4">
        {/* Section Hero avec padding top réduit pour compenser le header fixe */}
        <div className="pt-8 pb-12">
          <HeroSection />
        </div>

        {/* Section MNG */}
        <div className="pb-16">
          <MngPresentationBrief />
        </div>
        
        {/* Section Génération Musicale - Point central */}
        <div className="pb-16">
          <MusicGenerationSection />
        </div>
        
        {/* Sections principales */}
        <div className="pb-16">
          <MainSections />
        </div>
        
        {/* Footer */}
        <AppFooter />
      </div>

      {/* Admin Audit Button - Bottom Right */}
      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => navigate('/audit-general')}
            variant="outline"
            size="sm"
            className="bg-white/95 backdrop-blur-sm border-gray-300 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Audit EDN</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
