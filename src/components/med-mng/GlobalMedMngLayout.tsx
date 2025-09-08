import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EnhancedNavigation } from './EnhancedNavigation';
import { OptimizedSidebar } from './OptimizedSidebar';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
import { AccessibilityEnhancements } from './AccessibilityEnhancements';
import { Helmet } from 'react-helmet-async';

interface GlobalMedMngLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showNavigation?: boolean;
}

export const GlobalMedMngLayout: React.FC<GlobalMedMngLayoutProps> = ({ 
  children, 
  showSidebar = true,
  showNavigation = true 
}) => {
  return (
    <EnhancedErrorBoundary>
      <AccessibilityEnhancements>
        <TooltipProvider>
          <SidebarProvider>
            <Helmet>
              <title>MED-MNG - Plateforme Médicale Intelligente</title>
              <meta 
                name="description" 
                content="Plateforme d'apprentissage médical avec IA, génération musicale et contenus EDN optimisés pour les étudiants en médecine" 
              />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <meta name="theme-color" content="#2563eb" />
              <link rel="canonical" href={window.location.href} />
              
              {/* Structured Data */}
              <script type="application/ld+json">
                {JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "WebApplication",
                  "name": "MED-MNG",
                  "description": "Plateforme d'apprentissage médical avec intelligence artificielle",
                  "url": "https://med-mng.com",
                  "applicationCategory": "EducationalApplication",
                  "operatingSystem": "Web",
                  "offers": {
                    "@type": "Offer",
                    "category": "Educational"
                  }
                })}
              </script>
            </Helmet>

            <div className="min-h-screen flex w-full bg-background">
              {/* Sidebar */}
              {showSidebar && <OptimizedSidebar />}
              
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-h-screen">
                {/* Enhanced Navigation */}
                {showNavigation && <EnhancedNavigation />}
                
                {/* Page Content */}
                <main 
                  className="flex-1 overflow-auto"
                  id="main-content"
                  role="main"
                  tabIndex={-1}
                >
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </AccessibilityEnhancements>
    </EnhancedErrorBoundary>
  );
};

export default GlobalMedMngLayout;