
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { GlobalMiniPlayer } from "@/components/GlobalMiniPlayer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EcosIndex from "./pages/EcosIndex";
import EcosScenario from "./pages/EcosScenario";
import EdnIndex from "./pages/EdnIndex";
import EdnItem from "./pages/EdnItem";
import EdnItemImmersive from "./pages/EdnItemImmersive";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalAudioProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ecos" element={<EcosIndex />} />
              <Route path="/ecos/:scenarioId" element={<EcosScenario />} />
              <Route path="/edn" element={<EdnIndex />} />
              <Route path="/edn/:slug" element={<EdnItem />} />
              <Route path="/edn/immersive/:slug" element={<EdnItemImmersive />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <GlobalMiniPlayer />
          </BrowserRouter>
        </TooltipProvider>
      </GlobalAudioProvider>
    </QueryClientProvider>
  );
}

export default App;
