import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Play, 
  Music, 
  BookOpen, 
  Brain, 
  Users, 
  BarChart3, 
  Shield, 
  HeadphonesIcon,
  Zap,
  Star,
  Trophy,
  Target,
  Activity,
  Settings,
  MessageSquare,
  Sparkles,
  User,
  Heart,
  Clock,
  Award,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

interface FeatureButton {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  category: 'primary' | 'secondary' | 'premium' | 'admin';
  isActive: boolean;
  badge?: string;
  color: string;
}

export const FeatureLauncher: React.FC = () => {
  const navigate = useNavigate();

  const handleFeatureClick = (path: string, title: string) => {
    toast.success(`Lancement de ${title}...`, {
      icon: <Play className="w-4 h-4" />,
      duration: 2000
    });
    navigate(path);
  };

  const handlePremiumFeature = (title: string) => {
    toast.info(`${title} - Fonctionnalité Premium`, {
      icon: <Zap className="w-4 h-4" />,
      description: "Abonnez-vous pour accéder à cette fonctionnalité",
      action: {
        label: "Voir les tarifs",
        onClick: () => navigate('/med-mng/pricing')
      },
      duration: 4000
    });
  };

  const features: FeatureButton[] = [
    // Primary Features
    {
      id: 'generator',
      title: 'Générateur Musical IA',
      description: 'Créez des mnémotechniques musicaux avec l\'IA',
      icon: Music,
      action: () => handlePremiumFeature('Générateur Musical IA'),
      category: 'premium',
      isActive: true,
      badge: 'AI',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'edn',
      title: 'Référentiel EDN',
      description: '367 items du référentiel officiel',
      icon: BookOpen,
      action: () => handleFeatureClick('/edn', 'Référentiel EDN'),
      category: 'primary',
      isActive: true,
      badge: '367',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'chat',
      title: 'Assistant IA Médical',
      description: 'Support intelligent pour vos études',
      icon: Brain,
      action: () => handleFeatureClick('/chat', 'Assistant IA'),
      category: 'primary',
      isActive: true,
      badge: 'GPT-4',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'ecos',
      title: 'ECOS Interactifs',
      description: 'Examens cliniques objectifs structurés',
      icon: Target,
      action: () => handleFeatureClick('/ecos', 'ECOS'),
      category: 'primary',
      isActive: true,
      color: 'from-orange-500 to-red-600'
    },

    // Secondary Features
    {
      id: 'med-mng-create',
      title: 'Studio Musical',
      description: 'Créez vos compositions médicales',
      icon: HeadphonesIcon,
      action: () => handlePremiumFeature('Studio Musical'),
      category: 'premium',
      isActive: true,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'med-mng-library',
      title: 'Bibliothèque Musicale',
      description: 'Vos créations et favoris',
      icon: Heart,
      action: () => handleFeatureClick('/med-mng/library', 'Bibliothèque'),
      category: 'secondary',
      isActive: true,
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'community',
      title: 'Communauté',
      description: 'Échangez avec d\'autres étudiants',
      icon: Users,
      action: () => handleFeatureClick('/med-mng/community', 'Communauté'),
      category: 'secondary',
      isActive: true,
      color: 'from-teal-500 to-cyan-600'
    },
    {
      id: 'playlists',
      title: 'Playlists Collaboratives',
      description: 'Partagez vos sélections musicales',
      icon: Trophy,
      action: () => handleFeatureClick('/med-mng/playlists', 'Playlists'),
      category: 'secondary',
      isActive: true,
      color: 'from-yellow-500 to-orange-600'
    },

    // Analytics & Monitoring
    {
      id: 'analytics',
      title: 'Analytics Avancées',
      description: 'Analysez votre progression détaillée',
      icon: BarChart3,
      action: () => handleFeatureClick('/analytics', 'Analytics'),
      category: 'secondary',
      isActive: true,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'monitoring',
      title: 'Monitoring Temps Réel',
      description: 'Suivez vos performances en direct',
      icon: Activity,
      action: () => handleFeatureClick('/monitoring', 'Monitoring'),
      category: 'secondary',
      isActive: true,
      color: 'from-green-600 to-teal-600'
    },
    {
      id: 'profile',
      title: 'Profil Personnel',
      description: 'Gérez votre compte et préférences',
      icon: User,
      action: () => handleFeatureClick('/med-mng/profile', 'Profil'),
      category: 'secondary',
      isActive: true,
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Configurez votre expérience',
      icon: Settings,
      action: () => handleFeatureClick('/med-mng/settings', 'Paramètres'),
      category: 'secondary',
      isActive: true,
      color: 'from-slate-500 to-gray-600'
    },

    // Admin Features
    {
      id: 'admin',
      title: 'Administration',
      description: 'Gestion complète de la plateforme',
      icon: Shield,
      action: () => handleFeatureClick('/admin', 'Administration'),
      category: 'admin',
      isActive: true,
      color: 'from-red-600 to-rose-600'
    },
    {
      id: 'audit',
      title: 'Audit Qualité',
      description: 'Contrôle qualité du contenu',
      icon: Star,
      action: () => handleFeatureClick('/audit', 'Audit Qualité'),
      category: 'admin',
      isActive: true,
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'support',
      title: 'Support & Aide',
      description: 'Documentation et assistance',
      icon: HeadphonesIcon,
      action: () => handleFeatureClick('/support', 'Support'),
      category: 'secondary',
      isActive: true,
      color: 'from-cyan-500 to-blue-600'
    }
  ];

  const getFeaturesByCategory = (category: string) => {
    return features.filter(feature => feature.category === category);
  };

  const FeatureCard: React.FC<{ feature: FeatureButton; delay?: number }> = ({ feature, delay = 0 }) => {
    const IconComponent = feature.icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card 
          className={`p-6 h-full bg-gradient-to-br from-white/5 to-white/10 border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 cursor-pointer relative overflow-hidden ${
            !feature.isActive ? 'opacity-60' : ''
          }`}
          onClick={feature.action}
        >
          {/* Premium Badge */}
          {feature.category === 'premium' && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          )}

          {/* Feature Badge */}
          {feature.badge && feature.category !== 'premium' && (
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-white/10 border-white/20 text-white/70 text-xs">
                {feature.badge}
              </Badge>
            </div>
          )}

          <div className="flex flex-col h-full">
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} flex-shrink-0`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-2 truncate">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm line-clamp-2">
                  {feature.description}
                </p>
              </div>
            </div>

            <div className="mt-auto">
              <Button 
                className={`w-full bg-white/10 hover:bg-white/20 text-white border-0 ${
                  !feature.isActive ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                size="sm"
                disabled={!feature.isActive}
              >
                <Play className="w-4 h-4 mr-2" />
                {feature.category === 'premium' ? 'Découvrir' : 'Accéder'}
              </Button>
            </div>

            {/* Decorative gradient */}
            <div className={`absolute inset-0 opacity-5 bg-gradient-to-r ${feature.color}`} />
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-12">
      {/* Primary Features */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Fonctionnalités Principales</h2>
          <Badge variant="outline" className="bg-green-500/20 border-green-500/40 text-green-400">
            100% Actives
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getFeaturesByCategory('primary').map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} delay={index * 0.1} />
          ))}
        </div>
      </div>

      {/* Premium Features */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Fonctionnalités Premium</h2>
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
            IA Avancée
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFeaturesByCategory('premium').map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} delay={index * 0.1} />
          ))}
        </div>
      </div>

      {/* Secondary Features */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Outils & Communauté</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getFeaturesByCategory('secondary').map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} delay={index * 0.1} />
          ))}
        </div>
      </div>

      {/* Admin Features */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold text-white">Administration</h2>
          <Badge variant="outline" className="bg-red-500/20 border-red-500/40 text-red-400">
            Accès Restreint
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getFeaturesByCategory('admin').map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </div>
  );
};