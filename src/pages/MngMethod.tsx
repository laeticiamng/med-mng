
import { MngPresentation } from "@/components/MngPresentation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

const MngMethod = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </Link>
        </div>

        {/* Contenu complet de la méthode MNG */}
        <MngPresentation />
      </div>
    </div>
  );
};

export default MngMethod;
