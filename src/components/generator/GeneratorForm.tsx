import { TranslatedText } from '@/components/TranslatedText';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NOM_OFFRE_PREMIUM } from '@/config/offre';
import { ROUTE_PATHS } from '@/config/routes';
import { LIMITES_SUNO, dureeEstimeeAffichee, tronquerParoles } from '@/config/stylesMusicaux';
import type { AdvancedSunoParams } from '@/hooks/music/useAdvancedSunoParams';
import { Clock, Keyboard, LogIn, Sparkles, Wand2 } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdvancedParamsToggle } from './AdvancedParamsToggle';
import { EdnItemSelector } from './EdnItemSelector';
import { KeyboardShortcutsHelp, useKeyboardShortcuts } from './KeyboardShortcuts';
import { LyricsPreview } from './LyricsPreview';
import { LyricsStatusDisplay } from './LyricsStatusDisplay';
import { RangSelector } from './RangSelector';
import { StyleSelector } from './StyleSelector';

const LoginPromptBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Alert className="bg-primary/10 border-primary/30">
      <Sparkles className="h-4 w-4 text-primary" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-sm">
          <strong>Connectez-vous</strong> pour générer une chanson — génération audio incluse dans <strong>{NOM_OFFRE_PREMIUM}</strong>.
        </span>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate(ROUTE_PATHS.medMngLogin)}
          className="w-fit"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Se connecter
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export interface ParolesItem {
  paroles_musicales?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  item_code: string;
  title: string;
  subtitle?: string;
}

/**
 * Paroles envoyées pour un rang (RPC mm_contenu_immersif_item) :
 *  - A  : paroles_rang_a (repli : paroles_musicales, historiquement = rang A) ;
 *  - B  : paroles_rang_b uniquement (jamais les paroles A sous un titre « Rang B ») ;
 *  - AB : paroles_rang_ab, sinon rang A puis rang B.
 */
export const parolesPourRang = (paroles: ParolesItem | null | undefined, rang: string): string[] => {
  if (!paroles) return [];
  const a = paroles.paroles_rang_a ?? [];
  const b = paroles.paroles_rang_b ?? [];
  const ab = paroles.paroles_rang_ab ?? [];
  const legacy = paroles.paroles_musicales ?? [];
  if (rang === 'A') return a.length > 0 ? a : legacy;
  if (rang === 'B') return b;
  if (rang === 'AB') {
    if (ab.length > 0) return ab;
    if (a.length > 0 && b.length > 0) return [...a, ...b];
    return [];
  }
  return [];
};

interface GeneratorFormProps {
  selectedItem: string;
  setSelectedItem: (item: string) => void;
  selectedRang: string;
  setSelectedRang: (rang: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  allEdnItems: any[];
  itemsLoading: boolean;
  itemsError: string | null;
  ednLyrics: ParolesItem | null;
  lyricsLoading: boolean;
  lyricsError: string | null;
  canGenerate: () => boolean;
  handleGenerate: (advancedParams?: Partial<AdvancedSunoParams>) => void;
  resetForm: () => void;
  isGenerating: boolean;
  user: any;
  /** Accès Premium effectif (abonnement ou administrateur) et quota non épuisé. */
  canGenerateMusic: () => boolean;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  selectedItem,
  setSelectedItem,
  selectedRang,
  setSelectedRang,
  selectedStyle,
  setSelectedStyle,
  allEdnItems,
  itemsLoading,
  itemsError,
  ednLyrics,
  lyricsLoading,
  lyricsError,
  canGenerate,
  handleGenerate,
  resetForm,
  isGenerating,
  user,
  canGenerateMusic
}) => {
  const [advancedParams, setAdvancedParams] = useState<Partial<AdvancedSunoParams> | undefined>(undefined);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const handleGenerateWithParams = useCallback(() => {
    handleGenerate(advancedParams);
  }, [handleGenerate, advancedParams]);

  useKeyboardShortcuts({
    onGenerate: handleGenerateWithParams,
    onReset: resetForm,
    canGenerate: canGenerate(),
    isGenerating,
    enabled: true
  });

  // Paroles du rang choisi (celles qui seront envoyées), durée estimée et dépassement éventuel.
  const previewLyrics = useMemo(() => {
    const lignes = parolesPourRang(ednLyrics, selectedRang);
    return lignes.length > 0 ? lignes : null;
  }, [ednLyrics, selectedRang]);

  const apercuEnvoi = useMemo(() => {
    if (!previewLyrics) return null;
    const coupe = tronquerParoles(previewLyrics, LIMITES_SUNO.paroles);
    return { duree: dureeEstimeeAffichee(previewLyrics), tronque: coupe.tronque, lignesRetirees: coupe.lignesRetirees };
  }, [previewLyrics]);

  return (
    <PremiumCard variant="glass" className="mb-6 sm:mb-12 p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-warning to-warning/80 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
          <Wand2 className="h-5 w-5 sm:h-6 sm:w-6 text-warning-foreground" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
            <TranslatedText text="Configuration" />
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            <TranslatedText text="Item EDN, rang et style musical" />
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <EdnItemSelector
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          allEdnItems={allEdnItems}
          itemsLoading={itemsLoading}
          itemsError={itemsError}
          ednLyrics={ednLyrics}
        />

        <LyricsStatusDisplay
          selectedItem={selectedItem}
          lyricsLoading={lyricsLoading}
          lyricsError={lyricsError}
          ednLyrics={ednLyrics}
          selectedRang={selectedRang}
        />

        <RangSelector
          selectedRang={selectedRang}
          setSelectedRang={setSelectedRang}
          lyricsAvailability={{
            hasA: parolesPourRang(ednLyrics, 'A').length > 0,
            hasB: parolesPourRang(ednLyrics, 'B').length > 0,
            hasAB: parolesPourRang(ednLyrics, 'AB').length > 0
          }}
        />

        <StyleSelector
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
        />

        {selectedStyle && (
          <AdvancedParamsToggle
            onParamsChange={setAdvancedParams}
            disabled={isGenerating}
          />
        )}

        {previewLyrics && selectedStyle && (
          <div className="space-y-2">
            <LyricsPreview
              lyrics={previewLyrics}
              title={ednLyrics?.title}
              rang={selectedRang}
              className="mt-4"
            />
            {apercuEnvoi && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Durée demandée : environ {apercuEnvoi.duree} (calculée d'après les paroles).
                {apercuEnvoi.tronque && (
                  <span className="text-warning">
                    {' '}Les paroles dépassent la limite du service ({LIMITES_SUNO.paroles.toLocaleString('fr-FR')} caractères) : les {apercuEnvoi.lignesRetirees} dernières lignes ne seront pas chantées.
                  </span>
                )}
              </p>
            )}
          </div>
        )}

        {!user && <LoginPromptBanner />}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
          <PremiumButton
            variant="primary"
            size="lg"
            onClick={handleGenerateWithParams}
            disabled={!user || !canGenerate() || isGenerating || (user && !canGenerateMusic()) || lyricsLoading}
            className="flex-1 min-h-[48px] text-sm sm:text-base"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 border-2 border-white border-t-transparent rounded-full" />
                <span className="truncate"><TranslatedText text="Génération en cours…" /></span>
              </>
            ) : lyricsLoading ? (
              <>
                <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 border-2 border-current border-t-transparent rounded-full" />
                <span className="truncate"><TranslatedText text="Chargement des paroles…" /></span>
              </>
            ) : !user ? (
              <>
                <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 shrink-0" />
                <span className="truncate"><TranslatedText text="Connexion requise" /></span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 shrink-0" />
                <span className="truncate"><TranslatedText text="Générer la chanson" /></span>
              </>
            )}
          </PremiumButton>

          <PremiumButton
            variant="secondary"
            size="lg"
            onClick={resetForm}
            className="min-h-[48px] text-sm sm:text-base sm:w-auto"
          >
            <TranslatedText text="Réinitialiser" />
          </PremiumButton>

          <TooltipProvider>
            <Tooltip open={showShortcutsHelp} onOpenChange={setShowShortcutsHelp}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12"
                  aria-label="Raccourcis clavier"
                  onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
                >
                  <Keyboard className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="p-3">
                <KeyboardShortcutsHelp />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </PremiumCard>
  );
};
