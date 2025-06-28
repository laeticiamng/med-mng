
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalMiniPlayer } from "@/components/GlobalMiniPlayer";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AuthProvider } from "@/components/med-mng/AuthProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EcosIndex from "./pages/EcosIndex";
import EcosScenario from "./pages/EcosScenario";
import EdnIndex from "./pages/EdnIndex";
import EdnItem from "./pages/EdnItem";
import EdnItemImmersive from "./pages/EdnItemImmersive";
import { MedMngLogin } from "./pages/MedMngLogin";
import { MedMngSignup } from "./pages/MedMngSignup";
import { MedMngPricing } from "./pages/MedMngPricing";
import { MedMngLibrary } from "./pages/MedMngLibrary";
import { MedMngPlayer } from "./pages/MedMngPlayer";
import { MedMngCreate } from "./pages/MedMngCreate";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <GlobalAudioProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <LanguageSelector />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/ecos" element={<EcosIndex />} />
                  <Route path="/ecos/:scenarioId" element={<EcosScenario />} />
                  <Route path="/edn" element={<EdnIndex />} />
                  <Route path="/edn/:slug" element={<EdnItem />} />
                  <Route path="/edn/immersive/:slug" element={<EdnItemImmersive />} />
                  <Route path="/med-mng/login" element={<MedMngLogin />} />
                  <Route path="/med-mng/signup" element={<MedMngSignup />} />
                  <Route path="/med-mng/pricing" element={<MedMngPricing />} />
                  <Route path="/med-mng/library" element={<MedMngLibrary />} />
                  <Route path="/med-mng/create" element={<MedMngCreate />} />
                  <Route path="/med-mng/player/:songId" element={<MedMngPlayer />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <GlobalMiniPlayer />
              </BrowserRouter>
            </TooltipProvider>
          </GlobalAudioProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
