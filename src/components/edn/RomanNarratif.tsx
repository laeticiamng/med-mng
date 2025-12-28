import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, ChevronLeft, ChevronRight, Volume2, 
  VolumeX, Download, Share2, Bookmark, BookmarkCheck, Eye, Flame, Star, Loader2, Pause
} from 'lucide-react';
import { exportToPDF, shareContent } from '@/utils/exportUtils';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { useOicCompetences } from '@/hooks/useOicCompetences';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RomanNarratifProps {
  itemCode: string;
  title: string;
  tableauRangA?: any;
  tableauRangB?: any;
}

export const RomanNarratif: React.FC<RomanNarratifProps> = ({ 
  itemCode, 
  title, 
  tableauRangA, 
  tableauRangB 
}) => {
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();
  const hasTrackedRef = useRef(false);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [savedProgress, setSavedProgress] = useState<number | null>(null);

  // Charger les vraies compétences OIC
  const { competences: competencesA, loading: loadingA } = useOicCompetences(itemCode, 'A');
  const { competences: competencesB, loading: loadingB } = useOicCompetences(itemCode, 'B');

  // Load saved progress from localStorage
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
      
      // Restore saved reading progress
      const saved = localStorage.getItem(`roman-progress-${itemCode}`);
      if (saved) {
        const progress = JSON.parse(saved);
        setSavedProgress(progress.chapter);
        setIsBookmarked(true);
      }
    };
    load();
    
    // Cleanup speech synthesis on unmount
    return () => {
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [loadStats, itemCode]);

  useEffect(() => {
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'roman_narratif', action: 'view', itemCode }
      });
    }
  }, [itemCode]);

  // Speech rate state
  const [speechRate, setSpeechRate] = useState(() => {
    const saved = localStorage.getItem('roman-speech-rate');
    return saved ? parseFloat(saved) : 0.9;
  });

  // Handle Text-to-Speech with speed control
  const toggleAudio = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      toast.error('La synthèse vocale n\'est pas supportée par votre navigateur');
      return;
    }

    if (isAudioPlaying) {
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
      setIsAudioEnabled(false);
    } else {
      const chapters = generateChapters();
      const currentChap = chapters[currentChapter];
      if (!currentChap) return;

      const utterance = new SpeechSynthesisUtterance(currentChap.content);
      utterance.lang = 'fr-FR';
      utterance.rate = speechRate;
      utterance.pitch = 1;
      
      // Find a French voice
      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
      if (frenchVoice) utterance.voice = frenchVoice;

      utterance.onend = () => {
        setIsAudioPlaying(false);
        setIsAudioEnabled(false);
      };

      utterance.onerror = () => {
        setIsAudioPlaying(false);
        setIsAudioEnabled(false);
        toast.error('Erreur lors de la lecture audio');
      };

      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsAudioPlaying(true);
      setIsAudioEnabled(true);
      toast.success('Lecture audio démarrée');
    }
  }, [isAudioPlaying, currentChapter, speechRate]);

  // Handle speech rate change
  const handleSpeechRateChange = useCallback((rate: number) => {
    setSpeechRate(rate);
    localStorage.setItem('roman-speech-rate', rate.toString());
    if (isAudioPlaying) {
      // Restart with new rate
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
      setTimeout(() => toggleAudio(), 100);
    }
  }, [isAudioPlaying, toggleAudio]);

  // Handle bookmark
  const handleBookmark = useCallback(() => {
    const progressData = {
      chapter: currentChapter,
      timestamp: Date.now(),
      itemCode
    };
    localStorage.setItem(`roman-progress-${itemCode}`, JSON.stringify(progressData));
    setIsBookmarked(true);
    setSavedProgress(currentChapter);
    toast.success(`Marque-page ajouté au chapitre ${currentChapter + 1}`);
    
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { component: 'roman_narratif', action: 'bookmark', chapter: currentChapter, itemCode }
    });
  }, [currentChapter, itemCode, logActivity]);

  // Restore from bookmark
  const restoreFromBookmark = useCallback(() => {
    if (savedProgress !== null) {
      setCurrentChapter(savedProgress);
      setReadingProgress((savedProgress / generateChapters().length) * 100);
      toast.success(`Reprise au chapitre ${savedProgress + 1}`);
    }
  }, [savedProgress]);

  // Générer les chapitres basés sur les vraies compétences OIC
  const generateChapters = () => {
    const chapters = [];
    
    // Chapitre d'introduction
    chapters.push({
      id: 'intro',
      title: 'Prologue : L\'Art Médical',
      content: `Dans l'univers complexe de la médecine moderne, ${title} représente un défi majeur pour tout praticien. Cette histoire vous plongera au cœur des compétences essentielles de l'${itemCode}, où chaque décision peut changer une vie.\n\nNotre protagoniste, Dr. Sarah Martin, jeune interne passionnée, découvre l'importance cruciale de maîtriser parfaitement ces concepts médicaux. Son parcours vous guidera à travers les nuances de cette spécialité.\n\n"La médecine, c'est avant tout comprendre l'humain dans sa complexité", se répète-t-elle en consultant le dossier du prochain patient.`,
      type: 'intro',
      competences: []
    });

    // Chapitres pour rang A (vraies compétences OIC)
    if (competencesA.length > 0) {
      for (let i = 0; i < competencesA.length; i += 2) {
        const batch = competencesA.slice(i, i + 2);
        const chapterContent = batch.map((comp, idx) => 
          `"${comp.intitule}" explique le chef de service. "${comp.description?.substring(0, 250) || 'Cette compétence fondamentale est essentielle pour la prise en charge des patients.'}..."\n\nLe Dr. Martin note scrupuleusement: ${comp.objectif_id}.`
        ).join('\n\n');
        
        chapters.push({
          id: `rang-a-${i}`,
          title: `Chapitre ${chapters.length} : Les Fondements`,
          content: `Dr. Martin fait face à un cas complexe nécessitant la maîtrise des compétences de Rang A.\n\n${chapterContent}\n\nL'apprentissage se poursuit, chaque détail compte dans cette spécialité exigeante.`,
          type: 'rang-a',
          competences: batch
        });
      }
    }

    // Chapitres pour rang B (vraies compétences OIC)
    if (competencesB.length > 0) {
      for (let i = 0; i < competencesB.length; i += 2) {
        const batch = competencesB.slice(i, i + 2);
        const chapterContent = batch.map((comp, idx) => 
          `Face à "${comp.intitule}", elle mobilise toute son expertise. "${comp.description?.substring(0, 250) || 'L\'analyse experte révèle des nuances importantes pour la pratique clinique avancée.'}..."\n\nRéférence: ${comp.objectif_id}.`
        ).join('\n\n');
        
        chapters.push({
          id: `rang-b-${i}`,
          title: `Chapitre ${chapters.length} : L'Expertise`,
          content: `L'expertise de Dr. Martin est maintenant mise à l'épreuve avec les compétences de Rang B.\n\n${chapterContent}\n\nChaque décision experte façonne l'issue de ce cas délicat.`,
          type: 'rang-b',
          competences: batch
        });
      }
    }

    // Chapitre de conclusion
    chapters.push({
      id: 'epilogue',
      title: 'Épilogue : La Maîtrise Accomplie',
      content: `Plusieurs mois plus tard, Dr. Martin reflète sur son parcours d'apprentissage de l'${itemCode}. Les ${competencesA.length} compétences de Rang A et ${competencesB.length} compétences de Rang B ont contribué à faire d'elle une praticienne accomplie.\n\n"De la compréhension des fondements jusqu'à l'expertise avancée, chaque étape était nécessaire", se dit-elle en observant ses collègues internes débuter leur propre apprentissage.\n\nLe cycle de transmission des connaissances continue, perpétuant l'excellence médicale dans cette spécialité exigeante.\n\n${title} n'a plus de secrets pour elle. Elle est prête à affronter les défis les plus complexes de sa spécialité.`,
      type: 'conclusion',
      competences: []
    });

    return chapters;
  };

  const chapters = generateChapters();

  const nextChapter = async () => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setReadingProgress(((currentChapter + 1) / chapters.length) * 100);
      
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'roman_narratif', action: 'next_chapter', chapter: currentChapter + 1, itemCode }
      });
      
      // Award points when completing chapters
      if (currentChapter + 1 === chapters.length - 1) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await addPoints(user.id, 'itemMastered');
        }
      }
    }
  };

  const prevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      setReadingProgress(((currentChapter - 1) / chapters.length) * 100);
    }
  };

  const getChapterColor = (type: string) => {
    switch (type) {
      case 'intro': return 'border-primary/30 bg-primary/5';
      case 'rang-a': return 'border-success/30 bg-success/5';
      case 'rang-b': return 'border-accent/30 bg-accent/5';
      case 'conclusion': return 'border-warning/30 bg-warning/5';
      default: return 'border-border bg-muted/50';
    }
  };

  if (chapters.length === 0) {
    return (
      <Card className="border-2 border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Roman Narratif - {itemCode}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Génération du roman en cours...</p>
        </CardContent>
      </Card>
    );
  }

  const currentChap = chapters[currentChapter];

  return (
    <div className="space-y-6">
      {/* Table des matières cliquable */}
      <Card className="border border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Table des matières
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {chapters.map((chap, idx) => (
              <Button
                key={chap.id}
                variant={currentChapter === idx ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCurrentChapter(idx);
                  setReadingProgress((idx / chapters.length) * 100);
                }}
                className={`text-xs ${
                  chap.type === 'intro' ? 'border-primary/30' :
                  chap.type === 'rang-a' ? 'border-success/30' :
                  chap.type === 'rang-b' ? 'border-accent/30' :
                  'border-warning/30'
                }`}
              >
                {idx + 1}. {chap.title.replace(/^Chapitre \d+ : /, '').substring(0, 15)}...
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Header avec navigation */}
      <Card className="border-2 border-success/30">
        <CardHeader className="bg-gradient-to-r from-success to-accent text-success-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-background">
              <BookOpen className="h-6 w-6" />
              Roman Narratif - {itemCode}
            </CardTitle>
            <div className="flex items-center gap-2">
              {stats && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-background/20 rounded-full text-xs text-background">
                  <Flame className="h-3 w-3" />
                  <span className="font-bold">{stats.currentStreak ?? 0}j</span>
                  <Star className="h-3 w-3 ml-1" />
                  <span className="font-bold">Nv.{stats.level ?? 1}</span>
                </div>
              )}
              <Badge className="bg-background/20 text-background">
                Chapitre {currentChapter + 1} / {chapters.length}
              </Badge>
              {/* Speed control */}
              <div className="flex items-center gap-1 bg-background/20 rounded-full px-2">
                <button 
                  onClick={() => handleSpeechRateChange(Math.max(0.5, speechRate - 0.1))}
                  className="text-background hover:text-background/80 text-xs font-bold px-1"
                  disabled={speechRate <= 0.5}
                >
                  -
                </button>
                <span className="text-xs text-background font-medium min-w-[40px] text-center">
                  {speechRate.toFixed(1)}x
                </span>
                <button 
                  onClick={() => handleSpeechRateChange(Math.min(2, speechRate + 0.1))}
                  className="text-background hover:text-background/80 text-xs font-bold px-1"
                  disabled={speechRate >= 2}
                >
                  +
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAudio}
                className="text-background hover:bg-background/20"
                title={isAudioPlaying ? 'Arrêter la lecture' : 'Lire le chapitre'}
              >
                {isAudioPlaying ? <Pause className="h-4 w-4" /> : isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Barre de progression */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression de lecture</span>
                <span>{Math.round(readingProgress)}%</span>
              </div>
              <Progress value={readingProgress} className="h-2" />
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={prevChapter}
                disabled={currentChapter === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <div className="text-sm text-muted-foreground text-center flex-1 mx-4">
                {currentChap.title}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={nextChapter}
                disabled={currentChapter === chapters.length - 1}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu du chapitre */}
      <Card className={`border-2 ${getChapterColor(currentChap.type)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{currentChap.title}</CardTitle>
            <div className="flex items-center gap-2">
              {currentChap.competences && currentChap.competences.length > 0 && (
                <Badge variant="outline">
                  {currentChap.competences.length} compétences
                </Badge>
              )}
              <Badge className={getChapterColor(currentChap.type).replace('bg-', 'bg-').replace('border-', 'border-')}>
                {currentChap.type.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="prose prose-lg max-w-none space-y-4">
            {currentChap.content.split('\n\n').map((paragraph, index) => (
              <div key={index} className="p-4 bg-background/60 rounded-xl border-l-4 border-l-primary/30 hover:border-l-primary/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-foreground leading-relaxed font-medium">
                    {paragraph}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 mt-6 pt-4 border-t flex-wrap">
            {savedProgress !== null && savedProgress !== currentChapter && (
              <Button variant="outline" size="sm" onClick={restoreFromBookmark} className="border-warning/30 text-warning hover:bg-warning/10">
                <BookmarkCheck className="h-4 w-4 mr-1" />
                Reprendre Ch.{savedProgress + 1}
              </Button>
            )}
            <Button 
              variant={isBookmarked ? "default" : "outline"} 
              size="sm" 
              onClick={handleBookmark}
              className={isBookmarked ? "bg-success hover:bg-success/90" : ""}
            >
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
              {isBookmarked ? 'Enregistré' : 'Marque-page'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={isExporting}
              onClick={async () => {
                setIsExporting(true);
                const fullContent = chapters.map(c => `${c.title}\n\n${c.content}`).join('\n\n---\n\n');
                await exportToPDF({
                  title,
                  content: fullContent,
                  itemCode,
                  type: 'roman'
                });
                setIsExporting(false);
              }}
            >
              {isExporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
              Télécharger
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={isSharing}
              onClick={async () => {
                setIsSharing(true);
                await shareContent({
                  title,
                  content: currentChap.content,
                  itemCode,
                  type: 'roman'
                });
                setIsSharing(false);
              }}
            >
              {isSharing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Share2 className="h-4 w-4 mr-1" />}
              Partager
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table des matières */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Table des Matières
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                onClick={() => {
                  setCurrentChapter(index);
                  setReadingProgress((index / chapters.length) * 100);
                  logActivity({
                    activity_type: 'study',
                    count: 1,
                    metadata: { component: 'roman_narratif', action: 'jump_to_chapter', chapter: index, itemCode }
                  });
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all
                  ${index === currentChapter 
                    ? 'border-success/30 bg-success/5 text-success' 
                    : 'border-border hover:border-border/80 hover:bg-muted/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{chapter.title}</span>
                  <div className="flex items-center gap-2">
                    {chapter.competences > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {chapter.competences}
                      </Badge>
                    )}
                    <Badge className={`text-xs ${getChapterColor(chapter.type)}`}>
                      {chapter.type}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
