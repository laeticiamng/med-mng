import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { GlobalMiniPlayer } from "@/components/GlobalMiniPlayer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EcosIndex from "./pages/EcosIndex";
import EcosScenario from "./pages/EcosScenario";
import EdnIndex from "./pages/EdnIndex";
import EdnItem from "./pages/EdnItem";
import EdnItemImmersive from "./pages/EdnItemImmersive";
import EdnMusicLibrary from "./pages/EdnMusicLibrary";
import AuditGeneral from "./pages/AuditGeneral";
import AuditIC4 from "./pages/AuditIC4";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import { MedMngLogin } from "./pages/MedMngLogin";
import { MedMngSignup } from "./pages/MedMngSignup";
import { MedMngPricing } from "./pages/MedMngPricing";
import { MedMngLibrary } from "./pages/MedMngLibrary";
import { MedMngPlayer } from "./pages/MedMngPlayer";
import { MedMngCreate } from "./pages/MedMngCreate";
import { MedMngSubscribe } from "./pages/MedMngSubscribe";

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
              <Route path="/edn" element={<EdnIndex />} />
              <Route path="/edn/immersive/:slug" element={<EdnItemImmersive />} />
              <Route path="/edn/item/:slug" element={<EdnItem />} />
              <Route path="/edn/music-library" element={<EdnMusicLibrary />} />
              <Route path="/ecos" element={<EcosIndex />} />
              <Route path="/ecos/:scenarioId" element={<EcosScenario />} />
              <Route path="/audit" element={<AuditGeneral />} />
              <Route path="/audit/ic4" element={<AuditIC4 />} />
              <Route path="/med-mng/login" element={<MedMngLogin />} />
              <Route path="/med-mng/signup" element={<MedMngSignup />} />
              <Route path="/med-mng/pricing" element={<MedMngPricing />} />
              <Route path="/med-mng/subscribe" element={<MedMngSubscribe />} />
              <Route path="/med-mng/create" element={<MedMngCreate />} />
              <Route path="/med-mng/library" element={<MedMngLibrary />} />
              <Route path="/med-mng/player/:songId" element={<MedMngPlayer />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <GlobalMiniPlayer />
          </BrowserRouter>
        </TooltipProvider>
      </GlobalAudioProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
