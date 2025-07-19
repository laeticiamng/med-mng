export const AppFooter = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">MED MNG</h3>
            <p className="text-gray-400">
              Plateforme médicale intelligente pour la formation et l'excellence clinique.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Modules</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Base EDN Complète</li>
              <li>Générateur Musical</li>
              <li>Scénarios ECOS</li>
              <li>Outils d'Administration</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Documentation</li>
              <li>Assistance technique</li>
              <li>Formation</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 MED MNG. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};