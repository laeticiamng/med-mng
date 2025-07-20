
import { Music, Sparkles } from 'lucide-react';
import { allMusicStyles, isPremiumStyle } from './styles/MusicStylesData';

interface MusicStyleIndicatorProps {
  selectedStyle: string;
}

export const MusicStyleIndicator = ({ selectedStyle }: MusicStyleIndicatorProps) => {
  if (!selectedStyle) return null;

  // Gérer les styles combinés (format: "style1+style2+style3")
  const styleValues = selectedStyle.includes('+') ? selectedStyle.split('+') : [selectedStyle];
  const styles = styleValues.map(value => allMusicStyles.find(s => s.value === value)).filter(Boolean);
  
  if (styles.length === 0) return null;

  const hasPremiumStyles = styleValues.some(s => isPremiumStyle(s));
  const isComposition = styles.length > 1;

  return (
    <div className="text-center">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
        hasPremiumStyles 
          ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200'
          : 'bg-amber-100 text-amber-800'
      }`}>
        <Music className="h-4 w-4" />
        {hasPremiumStyles && <Sparkles className="h-4 w-4" />}
        <span className="font-medium">
          {isComposition ? (
            <>
              Composition Personnalisée : {styles.map(s => s?.label).join(' × ')} - Durée: {4 + (styles.length - 1) * 0.5} min
            </>
          ) : (
            <>
              Style sélectionné : {styles[0]?.label} - Durée: 4 minutes
            </>
          )}
        </span>
      </div>
      
      {isComposition && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="italic">Fusion créative de {styles.length} styles musicaux</span>
        </div>
      )}
    </div>
  );
};
