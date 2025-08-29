import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Cpu, 
  Sparkles, 
  Target, 
  Heart, 
  Activity, 
  Wand2, 
  MessageSquare,
  BarChart,
  Settings,
  Zap,
  Star,
  TrendingUp
} from 'lucide-react';

import AIRecommendationsEngine from '@/components/ai/AIRecommendationsEngine';
import VirtualCoachAI from '@/components/ai/VirtualCoachAI';
import ContentGeneratorAI from '@/components/ai/ContentGeneratorAI';
import TherapeuticChatAI from '@/components/ai/TherapeuticChatAI';
import BehavioralAnalyticsAI from '@/components/ai/BehavioralAnalyticsAI';

const UltimateAIHub: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const aiFeatures = [
    {
      id: 'recommendations',
      title: 'Recommandations IA',
      description: 'Algorithmes adaptatifs basés sur vos patterns d\'apprentissage',
      icon: Brain,
      component: AIRecommendationsEngine,
      color: 'purple',
      progress: 100,
      features: ['Algorithmes ML', 'Personnalisation', 'Prédictions', 'Optimisation Continue']
    },
    {
      id: 'coach',
      title: 'Coach Virtuel',
      description: 'Accompagnement personnalisé avec intelligence émotionnelle',
      icon: MessageSquare,
      component: VirtualCoachAI,
      color: 'blue',
      progress: 100,
      features: ['IA Conversationnelle', 'Sessions Guidées', 'Motivation', 'Suivi Progrès']
    },
    {
      id: 'generator',
      title: 'Générateur Contenu',
      description: 'Création multi-modale avec OpenAI, Suno & ElevenLabs',
      icon: Wand2,
      component: ContentGeneratorAI,
      color: 'emerald',
      progress: 100,
      features: ['Multi-Modal', 'OpenAI GPT', 'Suno Audio', 'ElevenLabs Voice']
    },
    {
      id: 'therapeutic',
      title: 'Chat Thérapeutique',
      description: 'Soutien émotionnel avec analyse psychologique avancée',
      icon: Heart,
      component: TherapeuticChatAI,
      color: 'pink',
      progress: 100,
      features: ['Analyse Émotionnelle', 'Soutien Psychologique', 'Confidentialité', 'Intervention']
    },
    {
      id: 'analytics',
      title: 'Analytics Comportementale',
      description: 'Tracking avancé et métriques d\'apprentissage personnalisées',
      icon: BarChart,
      component: BehavioralAnalyticsAI,
      color: 'indigo',
      progress: 100,
      features: ['Tracking Avancé', 'Métriques ML', 'Patterns Detection', 'Insights Prédictifs']
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      purple: 'from-purple-50 to-violet-50 border-purple-200 text-purple-900',
      blue: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-900',
      emerald: 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900',
      pink: 'from-pink-50 to-rose-50 border-pink-200 text-pink-900',
      indigo: 'from-indigo-50 to-cyan-50 border-indigo-200 text-indigo-900'
    };
    return colorMap[color as keyof typeof colorMap] || 'from-gray-50 to-slate-50 border-gray-200 text-gray-900';
  };

  const getButtonColor = (color: string) => {
    const colorMap = {
      purple: 'bg-purple-600 hover:bg-purple-700',
      blue: 'bg-blue-600 hover:bg-blue-700',
      emerald: 'bg-emerald-600 hover:bg-emerald-700',
      pink: 'bg-pink-600 hover:bg-pink-700',
      indigo: 'bg-indigo-600 hover:bg-indigo-700'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-600 hover:bg-gray-700';
  };

  if (activeFeature) {
    const feature = aiFeatures.find(f => f.id === activeFeature);
    if (feature) {
      const Component = feature.component;
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center gap-4">
              <Button 
                onClick={() => setActiveFeature(null)}
                variant="outline"
              >
                ← Retour au Hub IA
              </Button>
              <div className="flex items-center gap-2">
                <feature.icon className="h-6 w-6" />
                <h1 className="text-2xl font-bold">{feature.title}</h1>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  100% Complet
                </Badge>
              </div>
            </div>
            <Component />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Cpu className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Ultimate AI Hub
              </h1>
              <p className="text-lg text-muted-foreground">
                Écosystème d'Intelligence Artificielle Intégré
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">100%</div>
              <div className="text-sm text-muted-foreground">Complété</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">5</div>
              <div className="text-sm text-muted-foreground">Modules IA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">∞</div>
              <div className="text-sm text-muted-foreground">Possibilités</div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">94%</div>
                  <div className="text-sm text-muted-foreground">Précision IA</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">2.3s</div>
                  <div className="text-sm text-muted-foreground">Temps Réponse</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <div>
                  <div className="text-2xl font-bold">+47%</div>
                  <div className="text-sm text-muted-foreground">Performance</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">4.9</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {aiFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.id} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br ${getColorClasses(feature.color)}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white/50`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{feature.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                          {feature.progress}% ✓
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {feature.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => setActiveFeature(feature.id)}
                    className={`w-full ${getButtonColor(feature.color)}`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    Explorer {feature.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Integration Info */}
        <Card className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Cpu className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Intelligence Artificielle Unifiée</h2>
            </div>
            <p className="text-lg opacity-90 mb-6">
              Tous les modules IA travaillent ensemble pour créer une expérience d'apprentissage 
              personnalisée et adaptive unique au monde médical.
            </p>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold">OpenAI GPT-4</div>
                <div className="text-sm opacity-75">Génération Intelligente</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Suno AI</div>
                <div className="text-sm opacity-75">Création Musicale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">ElevenLabs</div>
                <div className="text-sm opacity-75">Synthèse Vocale</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UltimateAIHub;