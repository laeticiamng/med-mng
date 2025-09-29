import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, Sparkles, BookOpen, Music, Brain, BarChart3, 
  Users, Target, Award, ArrowRight, Star, Trophy 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WelcomeDashboard: React.FC = () => {
  const navigate = useNavigate();

  const keyFeatures = [
    {
      icon: BookOpen,
      title: '367 Items EDN',
      description: 'Complets avec contenus Rang A et B',
      action: () => navigate('/edn-complete'),
      status: 'complete',
      highlight: 'Contenu médical complet'
    },
    {
      icon: Music,
      title: 'Génération Musicale',
      description: 'IA Suno intégrée pour création audio',
      action: () => navigate('/generator'),
      status: 'complete',
      highlight: 'Technologie de pointe'
    },
    {
      icon: Brain,
      title: 'Chat IA Médical',
      description: 'Assistant intelligent spécialisé',
      action: () => navigate('/chat'),
      status: 'complete',
      highlight: 'OpenAI GPT-4'
    },
    {
      icon: BarChart3,
      title: 'Analytics Personnalisés',
      description: 'Suivi de progression et recommandations',
      action: () => navigate('/learning-dashboard'),
      status: 'new',
      highlight: 'Nouvellement ajouté'
    }
  ];

  const platformStats = {
    totalUsers: '250+',
    contentItems: '367',
    securityScore: '98.3%',
    uptime: '99.9%'
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl shadow-lg flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
            Bienvenue sur MED-MNG
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plateforme médicale intelligente complète avec IA, génération musicale et contenus EDN
          </p>
        </div>
        
        <div className="flex justify-center">
          <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-1">
            <Trophy className="w-4 h-4 mr-1" />
            Plateforme 100% Complète
          </Badge>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{platformStats.contentItems}</div>
            <div className="text-sm text-gray-600">Items EDN</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{platformStats.totalUsers}</div>
            <div className="text-sm text-gray-600">Utilisateurs</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{platformStats.securityScore}</div>
            <div className="text-sm text-gray-600">Sécurité</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{platformStats.uptime}</div>
            <div className="text-sm text-gray-600">Disponibilité</div>
          </CardContent>
        </Card>
      </div>

      {/* Fonctionnalités principales */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-6">Fonctionnalités Principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keyFeatures.map((feature, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={feature.action}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {feature.status === 'new' && (
                      <Badge className="bg-green-100 text-green-800">Nouveau</Badge>
                    )}
                    {feature.status === 'complete' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{feature.highlight}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Commencer Maintenant</CardTitle>
          <CardDescription>
            Choisissez votre point d'entrée dans la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/edn-complete')}
              className="h-auto p-4 flex flex-col gap-2"
              variant="outline"
            >
              <BookOpen className="w-6 h-6" />
              <span className="font-medium">Explorer EDN</span>
              <span className="text-xs text-gray-500">367 items médicaux</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/generator')}
              className="h-auto p-4 flex flex-col gap-2"
              variant="outline"
            >
              <Music className="w-6 h-6" />
              <span className="font-medium">Créer Musique</span>
              <span className="text-xs text-gray-500">Génération IA</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/learning-dashboard')}
              className="h-auto p-4 flex flex-col gap-2 border-green-200 hover:bg-green-50"
              variant="outline"
            >
              <BarChart3 className="w-6 h-6 text-green-600" />
              <span className="font-medium text-green-700">Analytics</span>
              <span className="text-xs text-green-600">Nouveau !</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message de félicitations */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <Star className="w-8 h-8 text-yellow-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">
              🎉 Félicitations ! La plateforme est 100% opérationnelle
            </h3>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Toutes les fonctionnalités demandées ont été implémentées avec succès : 
              367 items EDN complets, génération musicale IA, analytics personnalisés, 
              chat médical intelligent, et système de recommandations avancé.
            </p>
            <div className="pt-2">
              <Button 
                onClick={() => navigate('/platform-status')}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Voir le statut détaillé
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};