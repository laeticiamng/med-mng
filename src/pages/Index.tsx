import { AppFooter } from "@/components/AppFooter";
import { PremiumBackground } from "@/components/ui/premium-background";
import { PremiumCard } from "@/components/ui/premium-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { useNavigate } from "react-router-dom";
import { LogIn, CreditCard, BarChart3, Music, BookOpen, MessageSquare, Users, Zap, Target, Award, TrendingUp, Sparkles, Star, Brain, Settings, CheckCircle } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";
import { useFreeTrialLimit } from '@/hooks/useFreeTrialLimit';
import { Badge } from "@/components/ui/badge";
import { SystemHealthCheck } from "@/components/SystemHealthCheck";

const Index = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const { getRemainingGenerations, maxFreeGenerations } = useFreeTrialLimit();
  const remainingFree = getRemainingGenerations();

  // Sections principales consolidées
  const mainSections = [
    {
      id: "edn-complete",
      title: "Base EDN Complète",
      description: "367 items EDN (IC-1 à IC-367) avec 4,872 compétences OIC - Interface unifiée",
      icon: Brain,
      gradient: "from-indigo-500 to-purple-600",
      shadowColor: "shadow-indigo-500/25",
      features: [
        "367 items complets",
        "4,872 compétences OIC", 
        "Mode immersif et détails",
        "Recherche avancée"
      ],
      href: "/edn-complete",
      badge: "Complet",
      priority: 1
    },
    {
      id: "generator",
      title: "Générateur Musical IA",
      description: `Transformation des contenus EDN en chansons personnalisées - ${remainingFree} générations gratuites restantes`,
      icon: Music,
      gradient: "from-amber-500 to-orange-600",
      shadowColor: "shadow-amber-500/25",
      features: [
        "Sélection rapide d'items",
        "Styles musicaux variés",
        "Paroles médicales adaptées",
        "Bibliothèque personnelle"
      ],
      href: "/generator",
      badge: "IA Créative",
      priority: 2
    },
    {
      id: "chat",
      title: "Assistant Médical IA",
      description: "Chat intelligent connecté à la base de connaissances médicales EDN",
      icon: MessageSquare,
      gradient: "from-orange-500 to-red-600",
      shadowColor: "shadow-orange-500/25",
      features: [
        "Chat en temps réel",
        "Base médicale intégrée",
        "Historique des conversations",
        "Réponses contextuelles"
      ],
      href: "/chat",
      badge: "IA Conversationnelle",
      priority: 3
    },
    {
      id: "ecos",
      title: "Simulations ECOS",
      description: "Examens Cliniques Objectifs Structurés pour la pratique clinique",
      icon: Users,
      gradient: "from-green-500 to-emerald-600",
      shadowColor: "shadow-green-500/25",
      features: [
        "3 scénarios cliniques",
        "Évaluation par compétences",
        "Feedback personnalisé",
        "Entraînement progressif"
      ],
      href: "/ecos",
      badge: "Simulation",
      priority: 4
    },
    {
      id: "audit",
      title: "Audit et Analyses",
      description: "Outils d'analyse et d'audit pour la qualité des contenus EDN",
      icon: BarChart3,
      gradient: "from-blue-500 to-cyan-600",
      shadowColor: "shadow-blue-500/25",
      features: [
        "Audit de complétude",
        "Métriques de qualité",
        "Rapports détaillés",
        "Recommandations"
      ],
      href: "/audit",
      badge: "Analyse",
      priority: 5
    }
  ];

  return (
    <PremiumBackground>
      {/* Header premium avec navigation consolidée */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo premium */}
            <div className="flex items-center space-x-3" onClick={() => navigate('/')} className="cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl shadow-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  MED MNG
                </span>
                <div className="text-xs text-gray-500 font-medium">Plateforme Premium</div>
              </div>
            </div>
            
            {/* Navigation premium consolidée */}
            <div className="flex items-center gap-3">
              <PremiumButton
                variant="glass"
                size="sm"
                onClick={() => navigate('/edn-complete')}
                className="hidden md:inline-flex"
              >
                <Brain className="h-4 w-4 mr-2" />
                <TranslatedText text="Base EDN" />
              </PremiumButton>
              
              <PremiumButton
                variant="glass"
                size="sm"
                onClick={() => navigate('/generator')}
                className="hidden md:inline-flex"
              >
                <Music className="h-4 w-4 mr-2" />
                <TranslatedText text="Générateur" />
              </PremiumButton>
              
              <PremiumButton
                variant="glass"
                size="sm"
                onClick={() => navigate('/chat')}
                className="hidden sm:inline-flex"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                <TranslatedText text="Chat IA" />
              </PremiumButton>
              
              {isAdmin && (
                <PremiumButton
                  variant="glass"
                  size="sm"
                  onClick={() => navigate('/admin/import')}
                  className="hidden lg:inline-flex"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <TranslatedText text="Admin" />
                </PremiumButton>
              )}
              
              <PremiumButton
                variant="secondary"
                size="sm"
                onClick={() => navigate('/med-mng/pricing')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                <TranslatedText text="Tarifs" />
              </PremiumButton>
              
              <PremiumButton
                variant="primary"
                size="sm"
                onClick={() => navigate('/med-mng/login')}
              >
                <LogIn className="h-4 w-4 mr-2" />
                <TranslatedText text="Connexion" />
              </PremiumButton>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal unifié */}
      <div className="container mx-auto px-4">
        {/* Section Hero optimisée */}
        <div className="pt-16 pb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-8 border border-blue-200/50">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-semibold">Plateforme Médicale Intelligente</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
              MED MNG
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              <TranslatedText text="L'apprentissage médical réinventé avec l'intelligence artificielle" />
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
              <TranslatedText text="Contenus EDN officiels • Génération musicale IA • Assistant conversationnel • Simulations ECOS" />
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <PremiumButton
                variant="primary"
                size="xl"
                onClick={() => navigate('/edn-complete')}
              >
                <BookOpen className="h-6 w-6 mr-3" />
                <TranslatedText text="Explorer les 367 Items EDN" />
              </PremiumButton>
              <PremiumButton
                variant="glass"
                size="lg"
                onClick={() => navigate('/generator')}
              >
                <Music className="h-5 w-5 mr-2" />
                <TranslatedText text="Essayer le Générateur" />
              </PremiumButton>
            </div>

            {/* Statut des générations gratuites */}
            {remainingFree > 0 && (
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800 font-medium text-sm">
                  <TranslatedText text={`${remainingFree}/${maxFreeGenerations} générations musicales gratuites disponibles`} />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section principale consolidée - Une seule grille */}
        <div className="pb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              <TranslatedText text="Outils d'Apprentissage Intégrés" />
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              <TranslatedText text="Tous vos outils médicaux dans une seule plateforme unifiée" />
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {mainSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <PremiumCard 
                  key={section.id} 
                  variant="gradient" 
                  className="p-8 text-center cursor-pointer group hover:scale-105 transition-all duration-300" 
                  onClick={() => navigate(section.href)}
                >
                  <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${section.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg ${section.shadowColor} group-hover:shadow-xl transition-shadow`}>
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                  
                  <div className="flex items-center justify-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mr-3">
                      <TranslatedText text={section.title} />
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {section.badge}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    <TranslatedText text={section.description} />
                  </p>
                  
                  <div className="space-y-3 text-sm text-gray-600 mb-8">
                    {section.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <PremiumButton 
                    variant={section.priority <= 2 ? "primary" : "glass"} 
                    size="lg" 
                    className="w-full group-hover:shadow-lg transition-shadow"
                  >
                    <TranslatedText text={section.priority === 1 ? "Explorer Maintenant" : section.priority === 2 ? "Générer" : "Accéder"} />
                  </PremiumButton>
                </PremiumCard>
              );
            })}
          </div>
        </div>

        {/* Section valeurs ajoutées */}
        <div className="pb-20">
          <PremiumCard variant="glass" className="p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                <TranslatedText text="Pourquoi Choisir MED MNG ?" />
              </h2>
              <p className="text-xl text-gray-600">
                <TranslatedText text="La seule plateforme qui combine contenu officiel, IA et innovation pédagogique" />
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <PremiumCard variant="elevated" className="p-8">
                <Zap className="h-16 w-16 mx-auto mb-6 p-4 bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-2xl shadow-lg shadow-yellow-500/25" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">IA Avancée</h3>
                <p className="text-gray-600">Génération musicale et assistant conversationnel intégrés</p>
              </PremiumCard>
              <PremiumCard variant="elevated" className="p-8">
                <Target className="h-16 w-16 mx-auto mb-6 p-4 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-2xl shadow-lg shadow-green-500/25" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Contenu Officiel</h3>
                <p className="text-gray-600">367 items EDN complets avec 4,872 compétences OIC validées</p>
              </PremiumCard>
              <PremiumCard variant="elevated" className="p-8">
                <Award className="h-16 w-16 mx-auto mb-6 p-4 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-2xl shadow-lg shadow-orange-500/25" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Innovation</h3>
                <p className="text-gray-600">Méthode MNG brevetée pour l'apprentissage musical</p>
              </PremiumCard>
              <PremiumCard variant="elevated" className="p-8">
                <TrendingUp className="h-16 w-16 mx-auto mb-6 p-4 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-2xl shadow-lg shadow-blue-500/25" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Résultats</h3>
                <p className="text-gray-600">Amélioration prouvée de la rétention et des performances</p>
              </PremiumCard>
            </div>
          </PremiumCard>
        </div>

        {/* Section méthode MNG simplifiée */}
        <div className="pb-20">
          <PremiumCard variant="gradient" className="p-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Music className="h-10 w-10" />
                <h2 className="text-4xl font-bold">Méthode MNG</h2>
              </div>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                Music Neuro Learning Generator - La première méthode d'apprentissage médical par la musique
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <Target className="h-12 w-12 mx-auto mb-4 text-purple-200" />
                <h3 className="text-xl font-bold mb-3">Objectif</h3>
                <p className="text-purple-100">Transformer les savoirs complexes en contenus musicaux mémorisables</p>
              </div>
              <div>
                <Brain className="h-12 w-12 mx-auto mb-4 text-purple-200" />
                <h3 className="text-xl font-bold mb-3">Science</h3>
                <p className="text-purple-100">Basée sur les neurosciences et la neuroplasticité musicale</p>
              </div>
              <div>
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-200" />
                <h3 className="text-xl font-bold mb-3">Innovation</h3>
                <p className="text-purple-100">Génération automatique et personnalisation IA</p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Footer */}
        <AppFooter />
      </div>

      {/* System Health Check pour admin/dev */}
      <SystemHealthCheck />

      {/* Admin Audit Button optimisé */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <PremiumButton
            variant="glass"
            size="md"
            onClick={() => navigate('/audit')}
            className="shadow-2xl shadow-black/20"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            <span className="font-semibold">Audit</span>
          </PremiumButton>
        </div>
      )}
    </PremiumBackground>
  );
};

export default Index;