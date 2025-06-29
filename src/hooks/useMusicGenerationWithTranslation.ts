
import { useSunoMusicGeneration } from './music/useSunoMusicGeneration';
import { useMusicTransposition } from './music/useMusicTransposition';

export const useMusicGenerationWithTranslation = () => {
  const sunoGeneration = useSunoMusicGeneration();
  const { transposeMusicToLanguage } = useMusicTransposition();

  return {
    ...sunoGeneration,
    transposeMusicToLanguage
  };
};
