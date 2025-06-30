
import { HeroSection } from "@/components/HeroSection";
import { MngPresentationBrief } from "@/components/MngPresentationBrief";
import { MainSections } from "@/components/MainSections";
import { MusicGenerationSection } from "@/components/MusicGenerationSection";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn, CreditCard } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      
      {/* Header avec boutons de connexion et tarifs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/med-mng/pricing')}
            className="flex items-center gap-2 bg-white/80 hover:bg-white shadow-sm"
          >
            <CreditCard className="h-4 w-4" />
            <TranslatedText text="Voir les tarifs" />
          </Button>
          
          <Button
            onClick={() => navigate('/med-mng/login')}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            <TranslatedText text="Se connecter" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <HeroSection />
        <MngPresentationBrief />
        <MusicGenerationSection />
        <MainSections />
        <AppFooter />
      </div>
    </div>
  );
};

export default Index;
