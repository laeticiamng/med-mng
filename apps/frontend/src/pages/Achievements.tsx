import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GamificationPanel } from '@/components/gamification/GamificationPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Star, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Achievements: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Helmet>
        <title>Succès et Gamification - MED MNG</title>
        <meta name="description" content="Suivez votre progression, débloquez des succès et relevez des défis dans votre apprentissage médical." />
        <meta name="keywords" content="succès, badges, gamification, progression, apprentissage médical" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8" role="banner">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
              aria-label="Retourner à la page précédente"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Retour
            </Button>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3" id="achievements-title">
                <Trophy className="w-8 h-8 text-yellow-500" aria-hidden="true" />
                Succès & Progression
              </h1>
              <p className="text-gray-600 mt-1" id="achievements-description">
                Suivez votre progression et débloquez des récompenses exclusives
              </p>
            </div>
          </div>
        </header>

        {/* Statistiques rapides */}
        <section
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          role="region"
          aria-labelledby="stats-heading"
        >
          <h2 id="stats-heading" className="sr-only">
            Statistiques de progression
          </h2>

          <Card
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
            role="article"
            aria-labelledby="badges-stat"
          >
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" aria-hidden="true" />
              <h3
                className="text-2xl font-bold text-gray-900"
                id="badges-stat"
                aria-label="12 badges obtenus"
              >
                12
              </h3>
              <p className="text-gray-600">Badges Obtenus</p>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
            role="article"
            aria-labelledby="xp-stat"
          >
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 text-blue-500 mx-auto mb-3" aria-hidden="true" />
              <h3
                className="text-2xl font-bold text-gray-900"
                id="xp-stat"
                aria-label="2450 points d'expérience"
              >
                2,450
              </h3>
              <p className="text-gray-600">Points XP</p>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
            role="article"
            aria-labelledby="challenges-stat"
          >
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 text-green-500 mx-auto mb-3" aria-hidden="true" />
              <h3
                className="text-2xl font-bold text-gray-900"
                id="challenges-stat"
                aria-label="8 défis complétés"
              >
                8
              </h3>
              <p className="text-gray-600">Défis Complétés</p>
            </CardContent>
          </Card>
        </section>

        {/* Panel de gamification principal */}
        <div role="main" aria-labelledby="gamification-section">
          <h2 id="gamification-section" className="sr-only">
            Panneau de gamification
          </h2>
          <GamificationPanel />
        </div>

        {/* Section motivation */}
        <Card
          className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
          role="complementary"
          aria-labelledby="motivation-title"
        >
          <CardHeader>
            <CardTitle className="text-center" id="motivation-title">
              <span role="img" aria-label="Cible">🎯</span> Continuez sur votre lancée !
            </CardTitle>
            <CardDescription className="text-center">
              Vous êtes sur la bonne voie pour devenir un expert médical.
              Continuez à étudier et à relever des défis pour débloquer encore plus de récompenses !
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <nav className="flex justify-center gap-4" aria-label="Actions rapides">
              <Button
                onClick={() => navigate('/edn-complete')}
                aria-label="Accéder à la page d'étude EDN complète"
              >
                Continuer l'étude
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/generator')}
                aria-label="Accéder au générateur de musique"
              >
                Générer une musique
              </Button>
            </nav>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Achievements;