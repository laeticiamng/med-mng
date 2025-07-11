
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Users, BarChart3, Sparkles } from "lucide-react";

export const HeroSection = () => {
  return (
    <div className="text-center space-y-6 mb-12">
      <div className="flex items-center justify-center space-x-2">
        <Sparkles className="h-8 w-8 text-blue-600" />
        <h1 className="text-4xl font-bold text-gray-800">
          MED MNG
        </h1>
      </div>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Plateforme d'apprentissage immersive pour les étudiants en médecine avec contenus EDN et simulations ECOS
      </p>
      
      {/* Navigation rapide */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Link to="/edn">
          <Button size="lg" className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
            <BookOpen className="h-5 w-5" />
            <span>Items EDN (Interface unifiée)</span>
          </Button>
        </Link>
        <Link to="/ecos">
          <Button variant="outline" size="lg" className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Simulations ECOS</span>
          </Button>
        </Link>
        <Link to="/audit-general">
          <Button variant="outline" size="lg" className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Audit EDN</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
