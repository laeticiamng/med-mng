import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedMedicalMusicGeneration } from '@/hooks/useUnifiedMedicalMusicGeneration';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useSunoCallbackListener } from '@/hooks/useSunoCallbackListener';

export const useEnhancedParolesMusicales = (
  paroles: string[] = [], 
  itemData?: { paroles_rang_a?: string[], paroles_rang_b?: string[], paroles_rang_ab?: string[] }
) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('lofi-piano');
  const [musicDuration, setMusicDuration] = useState<number>(240);
  const [selectedVersion, setSelectedVersion] = useState<'A' | 'B' | 'AB'>('A');
  const { toast } = useToast();

  const {
    generateMedicalMusic,
    activeGenerations,
    generatedTracks,
    isGenerating: unifiedIsGenerating
  } = useUnifiedMedicalMusicGeneration();

  // Adapter l'interface pour compatibilité
  const isGenerating = {
    rangA: activeGenerations.some(gen => gen.taskId.includes('rang-a')),
    rangB: activeGenerations.some(gen => gen.taskId.includes('rang-b')),
    rangAB: activeGenerations.some(gen => gen.taskId.includes('rang-ab'))
  };

  const generatedAudio = generatedTracks.reduce((acc, track) => {
    if (track.taskId.includes('rang-a')) {
      acc.rangA = track.streamUrl;
    } else if (track.taskId.includes('rang-b')) {
      acc.rangB = track.streamUrl;
    } else if (track.taskId.includes('rang-ab')) {
      acc.rangAB = track.streamUrl;
    }
    return acc;
  }, {} as any);

  const generationProgress = activeGenerations[0] || null;
  const lastError = '';
  const currentLanguage = 'fr';

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

  // Écouter les musiques terminées via callbacks Suno
  const { completedAudio: callbackAudio } = useSunoCallbackListener();

  // Utiliser les vraies paroles de la base de données pour chaque rang
  const generateCombinedLyrics = (): string[] => {
    // Si on a accès aux vraies paroles par rang depuis la base de données
    if (itemData?.paroles_rang_a && itemData?.paroles_rang_b && itemData?.paroles_rang_ab) {
      console.log('🎵 Utilisation des vraies paroles structurées de la base de données');
      return [
        itemData.paroles_rang_a.join('\n'),
        itemData.paroles_rang_b.join('\n'),
        itemData.paroles_rang_ab.join('\n')
      ];
    }
    
    // Fallback vers les paroles originales si pas de données structurées
    if (!paroles || paroles.length < 2) {
      return paroles || [];
    }

    // Créer une version combinée intelligente des rangs A et B comme fallback
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
      console.log('🚀 APPEL generateMedicalMusic...');
      const rang = version === 'AB' ? 'AB' : version; // Utiliser 'AB' pour la version combinée
      const taskId = await generateMedicalMusic({
        itemCode: `rang-${version.toLowerCase()}`,
        rang,
        lyrics: [enhancedParoles[parolesIndex]],
        style: selectedStyle,
        duration: musicDuration
      });
      console.log(`✅ GÉNÉRATION LANCÉE POUR VERSION ${version}, TaskID:`, taskId);
      
      // L'audio sera automatiquement disponible via generatedTracks une fois terminé
      
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

  // Organiser les audios générés par version avec les 2 versions selon la doc Suno
  const organizedAudio = {
    // Rang A - 2 versions
    rangA_v1: generatedAudio.rangA || callbackAudio.rangA_v1 || callbackAudio.rangA || null,
    rangA_v2: generatedAudio.rangA_v2 || callbackAudio.rangA_v2 || null,
    
    // Rang B - 2 versions  
    rangB_v1: generatedAudio.rangB || callbackAudio.rangB_v1 || callbackAudio.rangB || null,
    rangB_v2: generatedAudio.rangB_v2 || callbackAudio.rangB_v2 || null,
    
    // Rang A+B Mix - 2 versions
    rangAB_v1: generatedAudio.rangAB || callbackAudio.rangAB_v1 || callbackAudio.rangAB || null,
    rangAB_v2: generatedAudio.rangAB_v2 || callbackAudio.rangAB_v2 || null,
    
    // Compatibilité avec l'ancienne interface (première version)
    rangA: generatedAudio.rangA || callbackAudio.rangA_v1 || callbackAudio.rangA || null,
    rangB: generatedAudio.rangB || callbackAudio.rangB_v1 || callbackAudio.rangB || null,
    rangAB: generatedAudio.rangAB || callbackAudio.rangAB_v1 || callbackAudio.rangAB || null
  };

  console.log('🎵 AUDIT AUDIO FINAL (2 versions par rang):', {
    generatedAudio,
    callbackAudio, 
    organizedAudio,
    '📊 Status': {
      'Rang A': { v1: !!organizedAudio.rangA_v1, v2: !!organizedAudio.rangA_v2 },
      'Rang B': { v1: !!organizedAudio.rangB_v1, v2: !!organizedAudio.rangB_v2 },
      'Rang A+B': { v1: !!organizedAudio.rangAB_v1, v2: !!organizedAudio.rangAB_v2 }
    }
  });

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