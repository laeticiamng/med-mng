import React, { useMemo, useState, useCallback } from 'react';
import { Wand2, Keyboard, LogIn, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { TranslatedText } from '@/components/TranslatedText';
import { ContentTypeSelector } from './ContentTypeSelector';
import { EdnItemSelector } from './EdnItemSelector'; 
import { EcosSelector } from './EcosSelector';
import { RangSelector } from './RangSelector';
import { StyleSelector } from './StyleSelector';
import { LyricsStatusDisplay } from './LyricsStatusDisplay';
import { EcosLyricsStatusDisplay } from './EcosLyricsStatusDisplay';
import { LyricsPreview } from './LyricsPreview';
import { AdvancedParamsToggle } from './AdvancedParamsToggle';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from './KeyboardShortcuts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROUTE_PATHS } from '@/config/routes';
import type { AdvancedSunoParams } from '@/hooks/music/useAdvancedSunoParams';

// ✅ Composant bannière d'invitation à se connecter
const LoginPromptBanner: React.FC<{ remainingFree: number }> = ({ remainingFree }) => {
  const navigate = useNavigate();
  
  return (
    <Alert className="bg-primary/10 border-primary/30">
      <Sparkles className="h-4 w-4 text-primary" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-sm">
          <strong>Connectez-vous</strong> pour générer de la musique — <strong>3 essais gratuits</strong> inclus !
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

interface GeneratorFormProps {
  contentType: string;
  setContentType: (type: string) => void;
  selectedItem: string;
  setSelectedItem: (item: string) => void;
  selectedRang: string;
  setSelectedRang: (rang: string) => void;
  selectedSituation: string;
  setSelectedSituation: (situation: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  allEdnItems: any[];
  itemsLoading: boolean;
  itemsError: string | null;
  ednLyrics: any;
  lyricsLoading: boolean;
  lyricsError: string | null;
  // ECOS lyrics props
  ecosLyrics?: any;
  ecosLyricsLoading?: boolean;
  ecosLyricsError?: string | null;
  canGenerate: () => boolean;
  handleGenerate: (advancedParams?: Partial<AdvancedSunoParams>) => void;
  resetForm: () => void;
  isGenerating: boolean;
  user: any;
  remainingFree: number;
  canGenerateMusic: () => boolean;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  contentType,
  setContentType,
  selectedItem,
  setSelectedItem,
  selectedRang,
  setSelectedRang,
  selectedSituation,
  setSelectedSituation,
  selectedStyle,
  setSelectedStyle,
  allEdnItems,
  itemsLoading,
  itemsError,
  ednLyrics,
  lyricsLoading,
  lyricsError,
  ecosLyrics,
  ecosLyricsLoading,
  ecosLyricsError,
  canGenerate,
  handleGenerate,
  resetForm,
  isGenerating,
  user,
  remainingFree,
  canGenerateMusic
}) => {
  // ✅ État local pour les paramètres avancés (reçus du composant enfant)
  const [advancedParams, setAdvancedParams] = useState<Partial<AdvancedSunoParams> | undefined>(undefined);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const handleContentTypeChange = (type: string) => {
    setContentType(type);
    if (type === 'edn') {
      setSelectedSituation('');
    } else {
      setSelectedItem('');
      setSelectedRang('');
    }
  };

  // ✅ Handler de génération avec paramètres avancés
  const handleGenerateWithParams = useCallback(() => {
    handleGenerate(advancedParams);
  }, [handleGenerate, advancedParams]);

  // ✅ Raccourcis clavier intégrés
  useKeyboardShortcuts({
    onGenerate: handleGenerateWithParams,
    onReset: resetForm,
    canGenerate: canGenerate(),
    isGenerating,
    enabled: true
  });

  // Calculer les paroles à afficher pour la preview
  const previewLyrics = useMemo(() => {
    if (contentType === 'edn' && ednLyrics && selectedRang) {
      if (selectedRang === 'A' && ednLyrics.paroles_rang_a?.length > 0) {
        return ednLyrics.paroles_rang_a;
      } else if (selectedRang === 'B' && ednLyrics.paroles_rang_b?.length > 0) {
        return ednLyrics.paroles_rang_b;
      } else if (selectedRang === 'AB' && ednLyrics.paroles_rang_ab?.length > 0) {
        return ednLyrics.paroles_rang_ab;
      } else if (ednLyrics.paroles_musicales?.length > 0) {
        return ednLyrics.paroles_musicales;
      }
    } else if (contentType === 'ecos' && ecosLyrics?.paroles?.length > 0) {
      return ecosLyrics.paroles;
    }
    return null;
  }, [contentType, ednLyrics, ecosLyrics, selectedRang]);

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
            <TranslatedText text="Type, item et style musical" />
          </p>
        </div>
      </div>
      
      <div className="space-y-8">
        <ContentTypeSelector
          contentType={contentType}
          onContentTypeChange={handleContentTypeChange}
          allEdnItems={allEdnItems}
          itemsLoading={itemsLoading}
        />

        {contentType === 'edn' && (
          <>
            <EdnItemSelector
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              allEdnItems={allEdnItems}
              itemsLoading={itemsLoading}
              itemsError={itemsError}
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
                hasA: !!(ednLyrics?.paroles_rang_a?.length > 0 || ednLyrics?.paroles_musicales?.length > 0),
                hasB: !!(ednLyrics?.paroles_rang_b?.length > 0 || ednLyrics?.paroles_musicales?.length > 0),
                hasAB: !!(ednLyrics?.paroles_rang_ab?.length > 0 || ednLyrics?.paroles_musicales?.length > 0)
              }}
            />
          </>
        )}

        {contentType === 'ecos' && (
          <>
            <EcosSelector
              selectedSituation={selectedSituation}
              setSelectedSituation={setSelectedSituation}
            />
            
            <EcosLyricsStatusDisplay
              selectedSituation={selectedSituation}
              ecosLyrics={ecosLyrics}
              loading={ecosLyricsLoading || false}
              error={ecosLyricsError || null}
            />
          </>
        )}

        {contentType && (
          <StyleSelector
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
          />
        )}

        {/* ✅ Paramètres avancés Suno - Maintenant connectés */}
        {contentType && selectedStyle && (
          <AdvancedParamsToggle
            onParamsChange={setAdvancedParams}
            disabled={isGenerating}
          />
        )}

        {/* Preview des paroles avant génération */}
        {previewLyrics && selectedStyle && (
          <LyricsPreview
            lyrics={previewLyrics}
            title={contentType === 'edn' ? ednLyrics?.title : ecosLyrics?.scenario?.title}
            rang={contentType === 'edn' ? selectedRang : undefined}
            className="mt-4"
          />
        )}

        {/* ✅ Message d'invitation à se connecter pour les utilisateurs non-authentifiés */}
        {!user && (
          <LoginPromptBanner remainingFree={remainingFree} />
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
          <PremiumButton
            variant="primary"
            size="lg"
            onClick={handleGenerateWithParams}
            disabled={!user || !canGenerate() || isGenerating || (user && !canGenerateMusic()) || lyricsLoading || ecosLyricsLoading}
            className="flex-1 min-h-[48px] text-sm sm:text-base"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 border-2 border-white border-t-transparent rounded-full" />
                <span className="truncate"><TranslatedText text="Génération..." /></span>
              </>
            ) : lyricsLoading || ecosLyricsLoading ? (
              <>
                <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 border-2 border-current border-t-transparent rounded-full" />
                <span className="truncate"><TranslatedText text="Chargement..." /></span>
              </>
            ) : !user ? (
              <>
                <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 shrink-0" />
                <span className="truncate"><TranslatedText text="Connexion requise" /></span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 shrink-0" />
                <span className="truncate"><TranslatedText text="Générer" /></span>
              </>
            )}
          </PremiumButton>
          
          <PremiumButton
            variant="secondary"
            size="lg"
            onClick={resetForm}
            className="min-h-[48px] text-sm sm:text-base sm:w-auto"
          >
            <TranslatedText text="Reset" />
          </PremiumButton>
          
          {/* ✅ Aide raccourcis clavier */}
          <TooltipProvider>
            <Tooltip open={showShortcutsHelp} onOpenChange={setShowShortcutsHelp}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12"
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