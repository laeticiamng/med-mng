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
      highlights: ["367 items", "4,872 compétences", "Interface unifiée"],
      badge: "Plateforme Complete"
    },
    {
      id: "med-mng", 
      title: "MED MNG",
      description: "Générateur musical médical avec IA Suno - Musiques thérapeutiques personnalisées",
      icon: Music,
      gradient: "from-green-500 to-teal-600", 
      highlights: ["Suno AI", "Génération musicale", "Thématiques médicales"],
      badge: "IA Musicale"
    },
    {
      id: "emotionscare",
      title: "EmotionsCare",
      description: "Plateforme de bien-être émotionnel avec intelligence artificielle et musique thérapeutique",
      icon: MessageSquare,
      gradient: "from-pink-500 to-rose-600",
      highlights: ["Bien-être", "IA thérapeutique", "Musique adaptative"],
      badge: "Bien-être"
    },
    {
      id: "emotionsroom",
      title: "EmotionsRoom",
      description: "Salon virtuel de connexion émotionnelle - Partage d'expériences et soutien mutuel",
      icon: Users,
      gradient: "from-amber-500 to-orange-600", 
      highlights: ["Connexion", "Communauté", "Soutien émotionnel"],
      badge: "Communauté"
    }
  ];

  // Nouvelles sections spécialisées
  const specializedSections = [
    {
      id: "urgegpt",
      title: "UrgeGPT",
      description: "Assistant IA pour les urgences médicales - Protocoles et aide à la décision",
      icon: Zap,
      gradient: "from-red-500 to-red-600",
      highlights: ["Urgences", "Protocoles", "Aide décision"],
      badge: "Urgences",
      access: "restricted"
    },
    {
      id: "biovida",
      title: "BioVida",
      description: "Analyse de profil de vie personnalisé - Recommandations de santé holistique",
      icon: Target,
      gradient: "from-purple-500 to-indigo-600",
      highlights: ["Analyse personnalisée", "Santé holistique", "Recommandations"],
      badge: "Santé Globale",
      access: "beta"
    },
    {
      id: "medilinko",
      title: "MediLinko",
      description: "Plateforme de consultation médicale virtuelle - Télémédecine intelligente",
      icon: Award,
      gradient: "from-blue-500 to-cyan-600",
      highlights: ["Télémédecine", "Consultation virtuelle", "IA médicale"],
      badge: "Télémedecine",
      access: "coming"
    }
  ];

  return (
    <PremiumBackground>
      <div className="min-h-screen">
        <SystemHealthCheck />
        
        {/* En-tête premium améliorée */}
        <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {/* Logo premium */}
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
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
              
              {/* Navigation premium */}
              <div className="flex items-center gap-4">
                {remainingFree > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    {remainingFree}/{maxFreeGenerations} générations gratuites
                  </Badge>
                )}
                
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/subscription')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  <TranslatedText text="Premium" />
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
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Écosystème Médical
                </span>
                <br />
                <span className="text-gray-900">Intelligent</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Une suite complète d'outils médicaux alimentés par l'IA pour l'apprentissage, 
                la pratique clinique et le bien-être émotionnel des professionnels de santé.
              </p>
            </div>

            {/* Métriques impressionnantes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">367</div>
                <div className="text-gray-600 text-sm">Items EDN</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">4,872</div>
                <div className="text-gray-600 text-sm">Compétences OIC</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">7+</div>
                <div className="text-gray-600 text-sm">Plateformes IA</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">24/7</div>
                <div className="text-gray-600 text-sm">Disponibilité</div>
              </div>
            </div>
          </div>

          {/* Sections principales - Layout amélioré */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Plateformes Principales</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Découvrez nos solutions intégrées pour l'apprentissage médical et le bien-être professionnel
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {mainSections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <PremiumCard
                    key={section.id}
                    className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer border-0 bg-white/50 backdrop-blur-sm"
                    onClick={() => navigate(`/${section.id}`)}
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg`}>
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        <Badge variant="secondary" className="bg-white/80 text-gray-700 border-gray-200">
                          {section.badge}
                        </Badge>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {section.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {section.description}
                      </p>
                      
                      <div className="space-y-2">
                        {section.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PremiumCard>
                );
              })}
            </div>
          </div>

          {/* Sections spécialisées */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Solutions Spécialisées</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Outils avancés pour des besoins médicaux spécifiques
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {specializedSections.map((section) => {
                const IconComponent = section.icon;
                const isRestricted = section.access === 'restricted';
                const isBeta = section.access === 'beta';
                const isComingSoon = section.access === 'coming';
                
                return (
                  <PremiumCard
                    key={section.id}
                    className={`group transition-all duration-300 cursor-pointer border-0 ${
                      isRestricted ? 'bg-red-50/50' : 
                      isBeta ? 'bg-purple-50/50' : 
                      isComingSoon ? 'bg-gray-50/50' : 'bg-white/50'
                    } backdrop-blur-sm hover:scale-[1.02]`}
                    onClick={() => {
                      if (!isComingSoon) navigate(`/${section.id}`);
                    }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-md`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <Badge 
                          variant={isRestricted ? 'destructive' : isBeta ? 'secondary' : 'default'}
                          className={
                            isRestricted ? 'bg-red-100 text-red-700' :
                            isBeta ? 'bg-purple-100 text-purple-700' :
                            isComingSoon ? 'bg-gray-100 text-gray-700' :
                            'bg-white/80 text-gray-700'
                          }
                        >
                          {isRestricted ? 'Accès Restreint' : 
                           isBeta ? 'Beta' : 
                           isComingSoon ? 'Bientôt' : section.badge}
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {section.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {section.description}
                      </p>
                      
                      <div className="space-y-1">
                        {section.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-gray-600">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PremiumCard>
                );
              })}
            </div>
          </div>

          {/* Section Analytics pour admin */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Outils d'Analyse</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Surveillez et optimisez les performances de la plateforme
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <PremiumCard
                className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm"
                onClick={() => navigate('/analytics')}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-white/80 text-blue-700 border-blue-200">Analytics</Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    Analytics Avancées
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    Tableaux de bord et métriques de performance en temps réel
                  </p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-600">Métriques en temps réel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-gray-600">Rapports détaillés</span>
                    </div>
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard
                className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-sm"
                onClick={() => navigate('/oic-extraction')}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-white/80 text-purple-700 border-purple-200">Extraction</Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    Extraction OIC
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    Outils d'extraction et d'analyse des compétences OIC
                  </p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-purple-500" />
                      <span className="text-xs text-gray-600">Extraction automatisée</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="w-3 h-3 text-pink-500" />
                      <span className="text-xs text-gray-600">Configuration avancée</span>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </div>
          </div>
        </div>

        <AppFooter />
      </div>

      {/* Panneau d'administration - Position absolue pour éviter conflits */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <PremiumButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/audit')}
            className="shadow-lg bg-white/90 backdrop-blur-sm border border-gray-200"
          >
            <Settings className="h-4 w-4 mr-2" />
            <span className="font-semibold">Audit</span>
          </PremiumButton>
        </div>
      )}
    </PremiumBackground>
  );
};

export default Index;