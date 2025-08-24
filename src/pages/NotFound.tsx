import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft, Search, BookOpen, Stethoscope, Music, Users, AlertTriangle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useResponsiveSpacing } from "@/hooks/useBreakpoints";

const NotFound = () => {
  const location = useLocation();
  const spacing = useResponsiveSpacing();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const quickLinks = [
    {
      title: "Accueil",
      description: "Retour à la page principale",
      icon: Home,
      path: "/",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "EDN Explorer",
      description: "Parcourir les items EDN",
      icon: BookOpen,
      path: "/edn",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Générateur Musical",
      description: "Créer des chansons éducatives",
      icon: Music,
      path: "/generator",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "ECOS",
      description: "Situations cliniques",
      icon: Stethoscope,
      path: "/ecos",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Page non trouvée - 404 | MED MNG</title>
        <meta name="description" content="La page que vous cherchez n'existe pas. Découvrez nos outils d'apprentissage médical avec MED MNG." />
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
        {/* Éléments de fond animés */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-red-200/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className={`relative z-10 container mx-auto ${spacing.container} flex items-center justify-center min-h-screen`}>
          <div className="max-w-4xl w-full">
            {/* En-tête avec erreur */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-6 shadow-xl">
                <AlertTriangle className="h-12 w-12 text-white" />
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
                404
              </h1>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                Page introuvable
              </h2>
              
              <p className="text-lg text-gray-600 mb-2">
                Oops ! La page que vous cherchez n'existe pas ou a été déplacée.
              </p>
              
              <p className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded inline-block">
                {location.pathname}
              </p>
            </div>

            {/* Barre de recherche */}
            <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Que recherchiez-vous ?
                </h3>
                <p className="text-gray-600 text-sm">
                  Utilisez notre recherche pour trouver ce dont vous avez besoin
                </p>
              </div>
              
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher un item EDN, une situation ECOS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
                />
              </div>
            </Card>

            {/* Liens rapides */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <Link key={link.path} to={link.path} className="group">
                    <Card className={`p-6 text-center ${link.bgColor} border-none hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in`}
                          style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${link.color} rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-gray-900">
                        {link.title}
                      </h4>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700">
                        {link.description}
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Aide supplémentaire */}
            <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 shadow-lg">
              <div className="text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Besoin d'aide ?
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Notre équipe est là pour vous aider. Si vous ne trouvez pas ce que vous cherchez, 
                  n'hésitez pas à nous contacter ou à consulter notre documentation.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/">
                    <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <Home className="h-4 w-4" />
                      Retour à l'accueil
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 border-blue-200 hover:bg-blue-50"
                    onClick={() => window.history.back()}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Page précédente
                  </Button>
                </div>
              </div>
            </Card>

            {/* Statistiques de la plateforme */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { number: "367", label: "Items EDN", color: "text-blue-600" },
                { number: "50+", label: "Situations ECOS", color: "text-purple-600" },
                { number: "10k+", label: "Chansons générées", color: "text-green-600" },
                { number: "2k+", label: "Étudiants actifs", color: "text-orange-600" }
              ].map((stat, index) => (
                <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.number}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
