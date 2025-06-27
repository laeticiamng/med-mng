
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EdnIndex from "./pages/EdnIndex";
import EcosIndex from "./pages/EcosIndex";
import EdnItem from "./pages/EdnItem";
import EdnItemImmersive from "./pages/EdnItemImmersive";
import EcosScenario from "./pages/EcosScenario";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/edn" element={<EdnIndex />} />
          <Route path="/ecos" element={<EcosIndex />} />
          <Route path="/edn/:slug" element={<EdnItem />} />
          <Route path="/edn/immersive/:slug" element={<EdnItemImmersive />} />
          <Route path="/ecos/:slug" element={<EcosScenario />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
