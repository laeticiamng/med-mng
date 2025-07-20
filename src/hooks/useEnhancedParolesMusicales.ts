import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';

export const useEnhancedParolesMusicales = (paroles: string[] = []) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('lofi-piano');
  const [musicDuration, setMusicDuration] = useState<number>(240);
  const [selectedVersion, setSelectedVersion] = useState<'A' | 'B' | 'AB'>('A');
  const { toast } = useToast();

  const {
    isGenerating,
    generatedAudio,
    generationProgress,
    lastError,
    generateMusicInLanguage,
    currentLanguage
  } = useMusicGenerationWithTranslation();

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    seek,
    changeVolume,
    stop
  } = useGlobalAudio();

  // Génération des paroles combinées pour la version A+B
  const generateCombinedLyrics = (): string[] => {
    if (!paroles || paroles.length < 2) {
      return paroles || [];
    }

    // Créer une version combinée intelligente des rangs A et B
    const combinedLyrics = `[Version Complète - Rang A & B Combinés]

[Rang A - Compétences Fondamentales]
${paroles[0] || 'Contenu Rang A non disponible'}

[Transition Musicale]
🎵 Maintenant passons aux compétences avancées... 🎵

[Rang B - Compétences Avancées]
${paroles[1] || 'Contenu Rang B non disponible'}

[Synthèse Finale]
Rang A et B unis, pour une maîtrise complète
Des bases aux sommets, le savoir se complète
Chaque niveau acquis renforce l'ensemble
Pour une expertise qui se rassemble`;

    return [...paroles, combinedLyrics];
  };

  const enhancedParoles = generateCombinedLyrics();

  const handleGenerate = async (version: 'A' | 'B' | 'AB') => {
    console.log(`🎵 GÉNÉRATION DEMANDÉE - Version ${version}`);
    
    const parolesIndex = version === 'A' ? 0 : version === 'B' ? 1 : 2;
    
    if (!enhancedParoles[parolesIndex]) {
      console.error(`❌ AUCUNE PAROLE POUR LA VERSION ${version}`);
      toast({
        title: "Paroles manquantes",
        description: `Aucune parole disponible pour la version ${version}`,
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🚀 APPEL generateMusicInLanguage...');
      const rang = version === 'AB' ? 'A' : version; // Utiliser 'A' pour la version combinée
      const audioUrl = await generateMusicInLanguage(rang, [enhancedParoles[parolesIndex]], selectedStyle, musicDuration);
      console.log(`✅ GÉNÉRATION TERMINÉE POUR VERSION ${version}, URL:`, audioUrl);
      
      // L'audio est automatiquement stocké par generateMusicInLanguage
      if (version === 'AB') {
        console.log('🎵 Audio AB généré:', audioUrl);
        // Le stockage est géré automatiquement par le hook de génération
      }
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION VERSION ${version}:`, error);
      toast({
        title: "Erreur de génération",
        description: `Impossible de générer la version ${version}`,
        variant: "destructive"
      });
    }
  };

  const handlePlayAudio = (audioUrl: string, title: string) => {
    if (!audioUrl) {
      console.error('❌ URL AUDIO MANQUANTE');
      return;
    }

    if (currentTrack?.url === audioUrl && isPlaying) {
      pause();
    } else {
        play({
          url: audioUrl,
          title: title,
          rang: selectedVersion === 'AB' ? 'A' : selectedVersion
        });
    }
  };

  // Organiser les audios générés par version
  const organizedAudio = {
    rangA: generatedAudio.rangA,
    rangB: generatedAudio.rangB,
    rangAB: generatedAudio.rangAB || null // Utiliser la version AB spécifique
  };

  return {
    selectedStyle,
    setSelectedStyle,
    musicDuration,
    setMusicDuration,
    selectedVersion,
    setSelectedVersion,
    isGenerating,
    generatedAudio: organizedAudio,
    generationProgress,
    lastError,
    currentLanguage,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    enhancedParoles,
    handleGenerate,
    handlePlayAudio,
    seek,
    changeVolume,
    stop
  };
};