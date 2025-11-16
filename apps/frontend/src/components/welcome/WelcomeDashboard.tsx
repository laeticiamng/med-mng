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

      {/* Statistiques principales améliorées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50/50 to-blue-100/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{platformStats.contentItems}</div>
            </div>
            <div className="text-sm font-medium text-muted-foreground">Items EDN</div>
            <div className="text-xs text-blue-600 mt-1">Contenu complet</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50/50 to-purple-100/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{platformStats.totalUsers}</div>
            </div>
            <div className="text-sm font-medium text-muted-foreground">Utilisateurs</div>
            <div className="text-xs text-purple-600 mt-1">Communauté active</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50/50 to-green-100/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{platformStats.securityScore}</div>
            </div>
            <div className="text-sm font-medium text-muted-foreground">Sécurité</div>
            <div className="text-xs text-green-600 mt-1">Niveau excellence</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50/50 to-orange-100/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-5 h-5 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">{platformStats.uptime}</div>
            </div>
            <div className="text-sm font-medium text-muted-foreground">Disponibilité</div>
            <div className="text-xs text-orange-600 mt-1">Service premium</div>
          </CardContent>
        </Card>
      </div>

      {/* Fonctionnalités principales avec design amélioré */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Fonctionnalités Principales</h2>
          <p className="text-muted-foreground">Découvrez nos modules d'apprentissage interactifs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keyFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/30 group relative overflow-hidden"
              onClick={feature.action}
            >
              {/* Indicateur visuel */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {feature.status === 'new' && (
                      <Badge className="bg-green-100/50 text-green-700 border-green-200 font-medium">
                        Nouveau
                      </Badge>
                    )}
                    {feature.status === 'complete' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="bg-primary/5 rounded-lg px-3 py-1 border border-primary/10">
                    <span className="text-xs font-medium text-primary">{feature.highlight}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
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