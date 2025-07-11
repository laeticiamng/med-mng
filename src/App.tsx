
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
import AuditComplete from "./pages/AuditComplete";
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
import { AuthProvider } from "./components/med-mng/AuthProvider";
import { ProtectedRoute } from "./components/med-mng/withAuth";
import { MedMngSuccess } from "./pages/MedMngSuccess";
import { MedMngProfile } from "./pages/MedMngProfile";
import { MedChat } from "./pages/MedChat";
import { SubscriptionTest } from "./pages/SubscriptionTest";
import AdminImport from "./pages/AdminImport";
import AdminAudit from "./pages/AdminAudit";
import AdminExtractEdn from "./pages/AdminExtractEdn";
import AdminCompleteProcess from "./pages/AdminCompleteProcess";
import AdminExtractEcos from "./pages/AdminExtractEcos";
import EdnObjectifsExtractionPage from "./pages/EdnObjectifsExtraction";
import OicDataQualityManager from "./pages/OicDataQualityManager";
import AuditCompleteness from "./pages/AuditCompleteness";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <GlobalAudioProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/generator" element={<Generator />} />
               <Route path="/edn" element={<ProtectedRoute><EdnIndex /></ProtectedRoute>} />
               <Route path="/edn/:slug" element={<ProtectedRoute><EdnItem /></ProtectedRoute>} />
               <Route path="/edn/:slug/immersive" element={<ProtectedRoute><EdnItemImmersive /></ProtectedRoute>} />
               <Route path="/edn/music-library" element={<ProtectedRoute><EdnMusicLibrary /></ProtectedRoute>} />
              <Route path="/ecos" element={<EcosIndex />} />
              <Route path="/ecos/:scenarioId" element={<EcosScenario />} />
              
                {/* Unified audit page */}
                <Route path="/audit" element={<AuditComplete />} />
                <Route path="/audit-completeness" element={<AuditCompleteness />} />
               
               {/* Redirect all old audit routes to new unified page */}
               <Route path="/audit-general" element={<Navigate to="/audit" replace />} />
               <Route path="/audit-edn" element={<Navigate to="/audit" replace />} />
               <Route path="/audit-unified" element={<Navigate to="/audit" replace />} />
               <Route path="/audit-ic1" element={<Navigate to="/audit" replace />} />
               <Route path="/audit-ic2" element={<Navigate to="/audit" replace />} />
               <Route path="/audit-ic4" element={<Navigate to="/audit" replace />} />
               <Route path="/audit-complete" element={<Navigate to="/audit" replace />} />
              
              <Route path="/mng-method" element={<MngMethod />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
              <Route path="/med-mng/login" element={<MedMngLogin />} />
              <Route path="/med-mng/signup" element={<MedMngSignup />} />
              <Route path="/med-mng/pricing" element={<MedMngPricing />} />
                <Route path="/med-mng/subscribe/:planId" element={<ProtectedRoute><MedMngSubscribe /></ProtectedRoute>} />
                <Route path="/med-mng/success" element={<ProtectedRoute><MedMngSuccess /></ProtectedRoute>} />
                <Route path="/med-mng/create" element={<ProtectedRoute><MedMngCreate /></ProtectedRoute>} />
              <Route path="/med-mng/library" element={<ProtectedRoute><MedMngLibrary /></ProtectedRoute>} />
              <Route path="/med-mng/profile" element={<ProtectedRoute><MedMngProfile /></ProtectedRoute>} />
              <Route path="/med-mng/player/:songId" element={<ProtectedRoute><MedMngPlayer /></ProtectedRoute>} />
              <Route path="/chat" element={<MedChat />} />
              <Route path="/admin/import" element={<AdminImport />} />
              <Route path="/admin/audit" element={<AdminAudit />} />
              <Route path="/admin/extract-edn" element={<AdminExtractEdn />} />
              <Route path="/admin/extract-ecos" element={<AdminExtractEcos />} />
               <Route path="/admin/extract-objectifs" element={<EdnObjectifsExtractionPage />} />
               <Route path="/admin/oic-quality" element={<OicDataQualityManager />} />
               <Route path="/admin/complete" element={<AdminCompleteProcess />} />
              <Route path="/test-subscriptions" element={<SubscriptionTest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </AuthProvider>
      </GlobalAudioProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
