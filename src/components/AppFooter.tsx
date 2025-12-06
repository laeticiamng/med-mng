import { Link } from "react-router-dom";
import { Music, ExternalLink } from "lucide-react";
import { ROUTE_PATHS } from "@/config/routes";

export const AppFooter = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Music className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-foreground">MED MNG</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Par EmotionsCare - L'apprentissage médical révolutionnaire avec la méthode MNG
            </p>
          </div>
          
          {/* Formations */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Formations</h3>
            <div className="space-y-2">
              <Link to={ROUTE_PATHS.ednComplete} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Items EDN
              </Link>
              <Link to={ROUTE_PATHS.ecosIndex} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Situations ECOS
              </Link>
              <Link to={ROUTE_PATHS.generator} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Générateur Musical
              </Link>
              <Link to={ROUTE_PATHS.chat} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Assistant IA
              </Link>
            </div>
          </div>
          
          {/* Outils */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Outils</h3>
            <div className="space-y-2">
              <Link to={ROUTE_PATHS.learningDashboard} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Analytics
              </Link>
              <Link to={ROUTE_PATHS.medMngLibrary} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Bibliothèque
              </Link>
              <Link to={ROUTE_PATHS.medMngCreate} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Créer
              </Link>
              <Link to={ROUTE_PATHS.statistics} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Statistiques
              </Link>
            </div>
          </div>
          
          {/* Légal */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Légal</h3>
            <div className="space-y-2">
              <Link to={ROUTE_PATHS.mentionsLegales} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Mentions Légales
              </Link>
              <Link to={ROUTE_PATHS.politiqueConfidentialite} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Politique de Confidentialité
              </Link>
              <Link to={ROUTE_PATHS.cgu} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                CGU
              </Link>
              <Link to={ROUTE_PATHS.declarationAccessibilite} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Accessibilité
              </Link>
              <Link to={ROUTE_PATHS.mesDonneesRgpd} className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Mes données RGPD
              </Link>
              <a href="mailto:contact@emotionscare.com" className="flex items-center gap-1 text-muted-foreground hover:text-primary text-sm transition-colors">
                Contact
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} EmotionsCare - MED MNG. Tous droits réservés.</p>
          <p className="mt-1">Méthode MNG - Music Neuro Learning Generator par Laëticia Motongane</p>
        </div>
      </div>
    </footer>
  );
};