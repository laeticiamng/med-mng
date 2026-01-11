/**
 * Bouton d'extension de musique (Suno Extend)
 * ✅ NOUVEAU: Permet d'étendre une musique existante
 */

import React, { useState } from 'react';
import { Expand, Loader2, Clock, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { secureSunoClient } from '@/lib/secureApiClient';
import { TranslatedText } from '@/components/TranslatedText';

interface ExtendMusicButtonProps {
  audioId: string;
  trackTitle?: string;
  currentDuration?: number;
  disabled?: boolean;
  onExtendStarted?: (taskId: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export const ExtendMusicButton: React.FC<ExtendMusicButtonProps> = ({
  audioId,
  trackTitle = 'Cette piste',
  currentDuration = 0,
  disabled = false,
  onExtendStarted,
  variant = 'outline',
  size = 'sm',
  showLabel = true
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [continueAt, setContinueAt] = useState(currentDuration);
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  const handleExtend = async () => {
    if (!audioId) return;

    setIsExtending(true);

    try {
      const result = await secureSunoClient.extendMusic(audioId, {
        prompt: additionalPrompt || undefined,
        continueAt: continueAt > 0 ? continueAt : undefined,
        model: 'V4_5ALL',
        defaultParamFlag: !additionalPrompt
      });

      toast.success('🎵 Extension en cours !', {
        description: 'La version étendue sera disponible dans quelques minutes.'
      });

      onExtendStarted?.(result.taskId);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erreur extension:', error);
      toast.error('Erreur lors de l\'extension', {
        description: error instanceof Error ? error.message : 'Veuillez réessayer'
      });
    } finally {
      setIsExtending(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsDialogOpen(true)}
        disabled={disabled || !audioId}
        className="gap-1.5"
      >
        <Expand className="h-4 w-4" />
        {showLabel && <TranslatedText text="Étendre" />}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Expand className="h-5 w-5 text-primary" />
              <TranslatedText text="Étendre la musique" />
            </DialogTitle>
            <DialogDescription>
              <TranslatedText text="Générer une version plus longue de" /> "{trackTitle}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Point de continuation */}
            {currentDuration > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <TranslatedText text="Continuer à partir de" />
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[continueAt]}
                    onValueChange={([v]) => setContinueAt(v)}
                    min={0}
                    max={currentDuration}
                    step={5}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="min-w-16 justify-center">
                    {formatDuration(continueAt)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  <TranslatedText text="La musique continuera à partir de ce point" />
                </p>
              </div>
            )}

            {/* Prompt additionnel */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                <TranslatedText text="Instructions (optionnel)" />
              </Label>
              <Input
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                placeholder="ex: Ajouter un solo de guitare, crescendo final..."
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                <TranslatedText text="Laissez vide pour continuer dans le même style" />
              </p>
            </div>

            {/* Info */}
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground">
                ℹ️ <TranslatedText text="L'extension ajoutera environ 2-4 minutes de musique. La génération prend généralement 2-3 minutes." />
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isExtending}
            >
              <TranslatedText text="Annuler" />
            </Button>
            <Button
              onClick={handleExtend}
              disabled={isExtending}
              className="gap-2"
            >
              {isExtending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <TranslatedText text="Extension..." />
                </>
              ) : (
                <>
                  <Expand className="h-4 w-4" />
                  <TranslatedText text="Étendre" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
