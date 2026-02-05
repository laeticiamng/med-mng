import { Link } from "react-router-dom";
import { Music } from "lucide-react";
import { ROUTE_PATHS } from "@/config/routes";

/**
 * MVPFooter - Footer simplifié pour le lancement MVP
 * Contient uniquement : Logo, Liens légaux, Copyright
 */
export const MVPFooter = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Description */}
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">MED-MNG</span>
          </div>
          
          {/* Liens légaux */}
          <nav className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link 
              to={ROUTE_PATHS.cgu} 
              className="hover:text-primary transition-colors"
            >
              CGU
            </Link>
            <Link 
              to={ROUTE_PATHS.mentionsLegales} 
              className="hover:text-primary transition-colors"
            >
              Mentions Légales
            </Link>
            <Link 
              to={ROUTE_PATHS.politiqueConfidentialite} 
              className="hover:text-primary transition-colors"
            >
              Politique de Confidentialité
            </Link>
            <a 
              href="mailto:contact@emotionscare.com" 
              className="hover:text-primary transition-colors"
            >
              Contact
            </a>
          </nav>
          
          {/* Copyright */}
          <div className="text-center md:text-right text-xs text-muted-foreground">
            <p>© 2026 EmotionsCare SASU</p>
            <p className="text-[10px] mt-1">Made with ❤️ for medical students</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
