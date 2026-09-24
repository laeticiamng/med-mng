
import React from 'react';
import { Card } from '@/components/ui/card';
import { MusicCardHeader } from './MusicCardHeader';
import { MissingParolesWarning } from './MissingParolesWarning';
import { ParolesDisplay } from './ParolesDisplay';
import { contientResidusDeBalisage, formatParoles, hasValidParoles, parolesSontRedigees } from './utils/parolesFormatter';
import { getCardStyling } from './utils/cardStyling';

interface MusicCardContentProps {
  rang: 'A' | 'B';
  title: string;
  paroles: string;
  isGenerating: boolean;
  children: React.ReactNode;
}

export const MusicCardContent: React.FC<MusicCardContentProps> = ({
  rang,
  title,
  paroles,
  isGenerating,
  children
}) => {
  const styling = getCardStyling(rang);
  const parolesArray = formatParoles(paroles);
  const hasValidParolesData = hasValidParoles(parolesArray);
  // Ne pas présenter comme « paroles » un texte qui n'en est pas : 345 des 367
  // items ne portent que des suites de mots-clés issues de l'import UNESS.
  const parolesRedigees = hasValidParolesData && parolesSontRedigees(parolesArray);
  const residusBalisage = hasValidParolesData && contientResidusDeBalisage(parolesArray);

  return (
    <Card className={`p-8 bg-gradient-to-br ${styling.gradientFrom} ${styling.gradientTo} ${styling.borderColor} shadow-xl ${isGenerating ? 'opacity-75' : ''}`}>
      <MusicCardHeader 
        title={title}
        iconColor={styling.iconColor}
        textColor={styling.textColor}
      />
      
      <MissingParolesWarning isVisible={!hasValidParolesData} />

      {hasValidParolesData && !parolesRedigees && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
          <p className="font-medium text-foreground">Pas encore de paroles rédigées pour ce rang</p>
          <p className="text-sm text-muted-foreground mt-1">
            La base ne contient ici qu'une liste de mots-clés extraits du référentiel
            {residusBalisage ? ', encore mêlés à des restes de balisage HTML' : ''} — pas un texte
            chantable. La génération ci-dessous n'utilise pas cette liste : elle repart des
            compétences OIC officielles de l'item.
          </p>
          <details className="mt-3">
            <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
              Voir les mots-clés bruts ({parolesArray.length} lignes)
            </summary>
            <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap font-mono leading-relaxed">
              {parolesArray.join(' · ')}
            </p>
          </details>
        </div>
      )}

      {parolesRedigees && (
        <ParolesDisplay
          parolesArray={parolesArray}
          rang={rang}
          textColor={styling.textColor}
        />
      )}

      <div className="space-y-4">
        {children}
      </div>
    </Card>
  );
};
