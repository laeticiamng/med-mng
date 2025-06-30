
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import Index from "./pages/Index";
import Generator from "./pages/Generator";
import EdnIndex from "./pages/EdnIndex";
import EdnItem from "./pages/EdnItem";
import EdnItemImmersive from "./pages/EdnItemImmersive";
import EdnMusicLibrary from "./pages/EdnMusicLibrary";
import EcosIndex from "./pages/EcosIndex";
import EcosScenario from "./pages/EcosScenario";
import AuditUnified from "./pages/AuditUnified";
import MngMethod from "./pages/MngMethod";
import NotFound from "./pages/NotFound";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import { MedMngLogin } from "./pages/MedMngLogin";
import { MedMngSignup } from "./pages/MedMngSignup";
import { MedMngPricing } from "./pages/MedMngPricing";
import { MedMngSubscribe } from "./pages/MedMngSubscribe";
import { MedMngCreate } from "./pages/MedMngCreate";
import { MedMngLibrary } from "./pages/MedMngLibrary";
import { MedMngPlayer } from "./pages/MedMngPlayer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <GlobalAudioProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/generator" element={<Generator />} />
              <Route path="/edn" element={<EdnIndex />} />
              <Route path="/edn/:slug" element={<EdnItem />} />
              <Route path="/edn/:slug/immersive" element={<EdnItemImmersive />} />
              <Route path="/edn/music-library" element={<EdnMusicLibrary />} />
              <Route path="/ecos" element={<EcosIndex />} />
              <Route path="/ecos/:scenarioId" element={<EcosScenario />} />
              
              {/* Unified audit page */}
              <Route path="/audit" element={<AuditUnified />} />
              
              {/* Redirect old audit routes to unified page */}
              <Route path="/audit-general" element={<Navigate to="/audit" replace />} />
              <Route path="/audit-edn" element={<Navigate to="/audit" replace />} />
              <Route path="/audit-ic1" element={<Navigate to="/audit" replace />} />
              <Route path="/audit-ic2" element={<Navigate to="/audit" replace />} />
              <Route path="/audit-ic4" element={<Navigate to="/audit" replace />} />
              
              <Route path="/mng-method" element={<MngMethod />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
              <Route path="/med-mng/login" element={<MedMngLogin />} />
              <Route path="/med-mng/signup" element={<MedMngSignup />} />
              <Route path="/med-mng/pricing" element={<MedMngPricing />} />
              <Route path="/med-mng/subscribe" element={<MedMngSubscribe />} />
              <Route path="/med-mng/create" element={<MedMngCreate />} />
              <Route path="/med-mng/library" element={<MedMngLibrary />} />
              <Route path="/med-mng/player/:songId" element={<MedMngPlayer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </GlobalAudioProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
