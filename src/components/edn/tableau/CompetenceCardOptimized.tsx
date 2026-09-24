import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { ContenuOfficielOIC } from './ContenuOfficielOIC';

interface CompetenceOIC {
  intitule: string;
  description: string;
  objectif_id?: string;
  rubrique?: string;
  keywords?: string[];
  titre_complet?: string;
  /** Descriptif officiel court (champ « Description » de LiSA) */
  sommaire?: string;
  /** Contenu complet rendu (LiSA 2026) */
  html?: string;
  url_source?: string;
  maj_lisa?: string;
  corrections?: { avant: string; apres: string; motif: string }[];
  contributeurs?: string;
  ordre_affichage?: number;
}

interface CompetenceCardOptimizedProps {
  competence: CompetenceOIC;
  index: number;
  rang: 'A' | 'B';
  isPlaceholder?: boolean;
}

/**
 * Carte d'une compétence OIC.
 *
 * Fermée : intitulé, descriptif officiel et début du contenu.
 * Ouverte : contenu COMPLET de la fiche LiSA 2026 (listes, tableaux, figures),
 * sans reformulation. Les anciennes « sections détaillées » (mécanismes,
 * indications…) étaient du remplissage générique : elles ne sont plus affichées.
 */
export const CompetenceCardOptimized: React.FC<CompetenceCardOptimizedProps> = ({
  competence,
  index,
  rang,
  isPlaceholder = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const themeColors = rang === 'A'
    ? { primary: 'from-primary to-primary/80', bg: 'bg-primary/5' }
    : { primary: 'from-accent to-accent/80', bg: 'bg-accent/5' };

  const texte = (competence.description || '').trim();
  const lignes = texte.split('\n').map((l) => l.trim()).filter(Boolean);
  const apercu = lignes.slice(0, 3).join('\n');
  const aDavantage = lignes.length > 3 || Boolean(competence.html && competence.html.includes('<img'))
    || Boolean(competence.html && competence.html.includes('<table'));

  return (
    <Card className={`${isPlaceholder ? 'opacity-60' : ''} transition-all duration-300 border-0 shadow-sm hover:shadow-lg group relative overflow-hidden bg-card`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${themeColors.primary} opacity-80`}></div>

      <CardHeader
        className={`${themeColors.bg} cursor-pointer transition-all duration-200 pb-4`}
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${themeColors.primary} text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md`}>
                {competence.ordre_affichage || index + 1}
              </div>
              {competence.objectif_id && (
                <Badge variant="outline" className="text-xs font-medium px-2 py-1 border-primary/30 text-primary">
                  {competence.objectif_id}
                </Badge>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-xl text-foreground leading-tight tracking-tight">
                  {competence.titre_complet || competence.intitule}
                </h3>
                {competence.rubrique && (
                  <Badge variant="secondary" className="text-xs">{competence.rubrique}</Badge>
                )}
              </div>

              {competence.sommaire && (
                <p className="text-sm italic text-muted-foreground">{competence.sommaire}</p>
              )}

              {!isExpanded && apercu && (
                <div className="bg-background/60 rounded-xl p-4 border border-border/50">
                  <p className="whitespace-pre-line text-base text-foreground/80 leading-relaxed line-clamp-4">{apercu}</p>
                  {aDavantage && (
                    <p className="mt-2 text-sm font-medium text-primary">Afficher le contenu complet</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <Button variant="ghost" size="sm" className="group-hover:bg-primary/10 shrink-0" aria-label={isExpanded ? 'Réduire' : 'Afficher le contenu complet'}>
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-8 px-6 sm:px-8">
          <Separator className="mb-6" />
          <div className="max-w-4xl">
            <ContenuOfficielOIC
              html={competence.html}
              texte={texte}
              urlSource={competence.url_source}
              majLisa={competence.maj_lisa}
              corrections={competence.corrections}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};
