
import { Link } from "react-router-dom";
import { Music } from "lucide-react";

export const AppFooter = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Music className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-foreground">MED MNG</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Par EmotionsCare - L'apprentissage médical révolutionnaire avec la méthode MNG
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Formations</h3>
            <div className="space-y-2">
              <Link to="/edn" className="block text-muted-foreground hover:text-primary text-sm">Items EDN</Link>
              <Link to="/ecos" className="block text-muted-foreground hover:text-primary text-sm">Situations ECOS</Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Outils</h3>
            <div className="space-y-2">
              <Link to="/audit-general" className="block text-muted-foreground hover:text-primary text-sm">Audit Général</Link>
              <Link to="/med-mng/library" className="block text-muted-foreground hover:text-primary text-sm">Bibliothèque</Link>
              <Link to="/med-mng/create" className="block text-muted-foreground hover:text-primary text-sm">Créer</Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Légal</h3>
            <div className="space-y-2">
              <Link to="/mentions-legales" className="block text-muted-foreground hover:text-primary text-sm">Mentions Légales</Link>
              <Link to="/politique-confidentialite" className="block text-muted-foreground hover:text-primary text-sm">Politique de Confidentialité</Link>
              <Link to="/cgu" className="block text-muted-foreground hover:text-primary text-sm">CGU</Link>
              <Link to="/declaration-accessibilite" className="block text-muted-foreground hover:text-primary text-sm">Accessibilité</Link>
              <a href="mailto:contact@emotionscare.com" className="block text-muted-foreground hover:text-primary text-sm">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2024 EmotionsCare - MED MNG. Tous droits réservés.</p>
          <p className="mt-1">Méthode MNG - Music Neuro Learning Generator par Laëticia Motongane</p>
        </div>
      </div>
    </footer>
  );
};
