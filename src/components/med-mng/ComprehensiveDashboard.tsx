import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SmartRecommendations, PerformanceDashboard, LearningAnalytics } from './AdvancedFeatures';
import { InteractiveMusicPlayer, InteractiveQuiz, StudyTimer } from './InteractiveStudyTools';
import { AccessibilityPanel } from './AccessibilityPanel';
import { BackgroundSyncStatus, ShareButton } from './PWAFeatures';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface ComprehensiveDashboardProps {
  className?: string;
}

const sampleTrack = {
  title: "Étude Cardiologie",
  artist: "MED-MNG AI",
  duration: 180,
  audioUrl: "/sample-audio.mp3",
  imageUrl: "/sample-cover.jpg"
};

const sampleQuestions = [
  {
    id: "1",
    question: "Quelle est la cause la plus fréquente d'insuffisance cardiaque ?",
    options: [
      "Hypertension artérielle",
      "Infarctus du myocarde",
      "Valvulopathie",
      "Cardiomyopathie"
    ],
    correctAnswer: 0,
    explanation: "L'hypertension artérielle est la cause la plus fréquente d'insuffisance cardiaque."
  },
  {
    id: "2", 
    question: "Quel est le traitement de première intention de l'hypertension ?",
    options: [
      "IEC",
      "Diurétiques",
      "Bêta-bloquants",
      "Inhibiteurs calciques"
    ],
    correctAnswer: 0,
    explanation: "Les IEC sont recommandés en première intention pour l'hypertension."
  }
];

export const ComprehensiveDashboard: React.FC<ComprehensiveDashboardProps> = ({ 
  className = "" 
}) => {
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          MED-MNG Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Plateforme d'apprentissage médical optimisée avec IA
        </p>
      </motion.div>

      {/* Top Row - Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LearningAnalytics />
        <PerformanceDashboard />
      </div>

      {/* Middle Row - Interactive Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveMusicPlayer track={sampleTrack} />
        <InteractiveQuiz 
          questions={sampleQuestions} 
          onComplete={(score) => console.log('Quiz completed with score:', score)}
        />
      </div>

      {/* Advanced Features Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SmartRecommendations />
        <StudyTimer onComplete={() => console.log('Study timer completed')} />
        <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
          <Button 
            onClick={() => setIsAccessibilityOpen(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Paramètres d'accessibilité
          </Button>
        </div>
      </div>

      {/* Accessibility Panel */}
      <AccessibilityPanel 
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />

      {/* Bottom Row - PWA Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BackgroundSyncStatus />
        <ShareButton 
          title="MED-MNG"
          text="Découvrez cette plateforme d'apprentissage médical"
        />
        <div className="flex items-center justify-center p-6 border rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            🎉 Plateforme 100% optimisée et accessible !
          </p>
        </div>
      </div>
    </div>
  );
};