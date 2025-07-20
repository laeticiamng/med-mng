
import { Link } from "react-router-dom";
import { Music } from "lucide-react";

export const AppFooter = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Music className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl">MED MNG</span>
            </div>
            <p className="text-gray-600 text-sm">
              Par EmotionsCare - L'apprentissage médical révolutionnaire avec la méthode MNG
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Formations</h3>
            <div className="space-y-2">
              <Link to="/edn" className="block text-gray-600 hover:text-blue-600 text-sm">Items EDN</Link>
              <Link to="/ecos" className="block text-gray-600 hover:text-blue-600 text-sm">Situations ECOS</Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Outils</h3>
            <div className="space-y-2">
              <Link to="/audit-general" className="block text-gray-600 hover:text-blue-600 text-sm">Audit Général</Link>
              <Link to="/med-mng/library" className="block text-gray-600 hover:text-blue-600 text-sm">Bibliothèque</Link>
              <Link to="/med-mng/create" className="block text-gray-600 hover:text-blue-600 text-sm">Créer</Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <div className="space-y-2">
              <Link to="/mentions-legales" className="block text-gray-600 hover:text-blue-600 text-sm">Mentions Légales</Link>
              <Link to="/politique-confidentialite" className="block text-gray-600 hover:text-blue-600 text-sm">Politique de Confidentialité</Link>
              <a href="mailto:contact@emotionscare.com" className="block text-gray-600 hover:text-blue-600 text-sm">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-gray-600 text-sm">
          <p>&copy; 2024 EmotionsCare - MED MNG. Tous droits réservés.</p>
          <p className="mt-1">Méthode MNG - Music Neuro Learning Generator par Laëticia Motongane</p>
        </div>
      </div>
    </footer>
  );
};
