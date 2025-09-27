import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { ProgressionPersonnalisee } from '@/components/progression/ProgressionPersonnalisee';

const ProgressionPage = () => {
  const navigate = useNavigate();

  const handleAmbitionChange = (ambition: string) => {
    console.log('Ambition sélectionnée:', ambition);
    // Ici on pourrait sauvegarder la préférence de l'utilisateur
  };

  return (
    <>
      <Helmet>
        <title>Progression Personnalisée | MED-MNG</title>
        <meta name="description" content="Adapte ton parcours d'apprentissage selon ton ambition. Le Neuro Learning Generator s'ajuste à tes objectifs ECN." />
        <meta name="keywords" content="progression personnalisée, ambition ECN, neuro learning, MED-MNG, objectifs médicaux" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Particules d'ambition */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-10 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {['🎯', '🚀', '👑', '⭐', '🏆', '🔥', '💎', '⚡'][i % 8]}
            </div>
          ))}
        </div>

        <div className="relative z-10 p-6">
          {/* Navigation */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="text-white hover:bg-white/20"
            >
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Button>
          </div>

          {/* Contenu principal */}
          <ProgressionPersonnalisee 
            onAmbitionChange={handleAmbitionChange}
            className="max-w-7xl mx-auto"
          />
        </div>
      </div>
    </>
  );
};

export default ProgressionPage;