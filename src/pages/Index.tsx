
import { HeroSection } from "@/components/HeroSection";
import { MngPresentation } from "@/components/MngPresentation";
import { MainSections } from "@/components/MainSections";
import { AppFooter } from "@/components/AppFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <HeroSection />
        <MngPresentation />
        <MainSections />
        <AppFooter />
      </div>
    </div>
  );
};

export default Index;
