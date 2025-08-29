import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Music, 
  BookOpen, 
  MessageSquare, 
  Users,
  X,
  ArrowRight,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface WelcomeBannerProps {
  userName?: string;
  onDismiss?: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ 
  userName = "Étudiant", 
  onDismiss 
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      icon: Music,
      title: "Générateur IA Musical",
      description: "Transformez vos cours en chansons mémorables",
      action: () => navigate('/generator'),
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BookOpen,
      title: "367 Items EDN",
      description: "Base complète avec compétences OIC intégrées",
      action: () => navigate('/edn'),
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: MessageSquare,
      title: "Assistant IA Médical",
      description: "Chat intelligent spécialisé en médecine",
      action: () => navigate('/chat'),
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Users,
      title: "Simulations ECOS",
      description: "Examens cliniques objectifs immersifs",
      action: () => navigate('/ecos'),
      color: "from-green-500 to-emerald-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [tips.length]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const currentTipData = tips[currentTip];
  const IconComponent = currentTipData.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-indigo-900/90 to-purple-900/90 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
          <CardContent className="p-6 relative">
            {/* Bouton de fermeture */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex items-start gap-6">
              {/* Avatar de bienvenue */}
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>

              <div className="flex-1">
                {/* Message de bienvenue */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    Bienvenue sur MED MNG, {userName} !
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </h2>
                  <p className="text-gray-300 text-lg">
                    Révolutionnez votre apprentissage médical avec l'IA musicale
                  </p>
                </div>

                {/* Conseil rotatif */}
                <motion.div
                  key={currentTip}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 bg-gradient-to-br ${currentTipData.color} rounded-lg flex items-center justify-center shadow-sm`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{currentTipData.title}</h3>
                      <p className="text-sm text-gray-300">{currentTipData.description}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={currentTipData.action}
                      className="bg-white/20 hover:bg-white/30 text-white border-0 shadow-sm"
                    >
                      Découvrir
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>

                {/* Indicateurs de progression */}
                <div className="flex items-center gap-2 mt-4">
                  {tips.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentTip ? 'bg-white w-6' : 'bg-white/30'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-white/60 ml-2">
                    Conseil {currentTip + 1} sur {tips.length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};