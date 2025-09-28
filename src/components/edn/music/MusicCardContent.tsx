
import { Card } from '@/components/ui/card';
import { MusicCardHeader } from './MusicCardHeader';
import { MissingParolesWarning } from './MissingParolesWarning';
import { ParolesDisplay } from './ParolesDisplay';
import { formatParoles, hasValidParoles } from './utils/parolesFormatter';
import { getCardStyling } from './utils/cardStyling';

interface MusicCardContentProps {
  rang: 'A' | 'B';
  title: string;
  paroles: string;
  isGenerating: boolean;
  children: React.ReactNode;
}

export const MusicCardContent = ({
  rang,
  title,
  paroles,
  isGenerating,
  children
}: MusicCardContentProps) => {
  const styling = getCardStyling(rang);
  const parolesArray = formatParoles(paroles);
  const hasValidParolesData = hasValidParoles(parolesArray);

  return (
    <Card className={`p-8 bg-gradient-to-br ${styling.gradientFrom} ${styling.gradientTo} ${styling.borderColor} shadow-xl ${isGenerating ? 'opacity-75' : ''}`}>
      <MusicCardHeader 
        title={title}
        iconColor={styling.iconColor}
        textColor={styling.textColor}
      />
      
      <MissingParolesWarning isVisible={!hasValidParolesData} />
      
      <ParolesDisplay 
        parolesArray={parolesArray}
        rang={rang}
        textColor={styling.textColor}
      />

      <div className="space-y-4">
        {children}
      </div>
    </Card>
  );
};
