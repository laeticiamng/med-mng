/**
 * Bouton de génération de paroles IA
 * ✅ NOUVEAU: Génère des paroles avec Suno AI
 */

import React, { useState } from 'react';
import { FileText, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { secureSunoClient } from '@/lib/secureApiClient';
import { TranslatedText } from '@/components/TranslatedText';

interface GenerateLyricsButtonProps {
  onLyricsGenerated?: (lyrics: string) => void;
  defaultPrompt?: string;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const GenerateLyricsButton: React.FC<GenerateLyricsButtonProps> = ({
  onLyricsGenerated,
  defaultPrompt = '',
  disabled = false,
  variant = 'outline',
  size = 'sm'
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [generatedLyrics, setGeneratedLyrics] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez entrer un thème ou une description');
      return;
    }

    setIsGenerating(true);
    setGeneratedLyrics('');

    try {
      const result = await secureSunoClient.generateLyrics(prompt);

      if (result.lyrics) {
        setGeneratedLyrics(result.lyrics);
        toast.success('Paroles générées avec succès !');
      } else if (result.taskId) {
        toast.info('Génération en cours...', {
          description: 'Les paroles seront disponibles dans quelques secondes.'
        });
        // Polling pour récupérer le résultat
        // Note: Dans une implémentation complète, on utiliserait le callback
      }
    } catch (error) {
      console.error('Erreur génération paroles:', error);
      toast.error('Erreur lors de la génération', {
        description: error instanceof Error ? error.message : 'Veuillez réessayer'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLyrics);
      setCopied(true);
      toast.success('Paroles copiées !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erreur de copie');
    }
  };

  const handleUse = () => {
    onLyricsGenerated?.(generatedLyrics);
    toast.success('Paroles appliquées');
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsDialogOpen(true)}
        disabled={disabled}
        className="gap-1.5"
      >
        <FileText className="h-4 w-4" />
        <TranslatedText text="Générer paroles IA" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <TranslatedText text="Générateur de paroles IA" />
            </DialogTitle>
            <DialogDescription>
              <TranslatedText text="Décrivez le thème et laissez Suno créer les paroles" />
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Prompt */}
            <div className="space-y-2">
              <Label><TranslatedText text="Thème / Description" /></Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="ex: Une chanson sur l'anatomie du cœur, les différentes cavités, le cycle cardiaque..."
                className="min-h-24"
              />
              <p className="text-xs text-muted-foreground">
                <TranslatedText text="Soyez précis sur le contenu médical à inclure" />
              </p>
            </div>

            {/* Exemples de prompts */}
            <div className="flex flex-wrap gap-1.5">
              {[
                "Pharmacologie des antibiotiques",
                "Symptômes de l'insuffisance cardiaque",
                "Examen neurologique complet"
              ].map(example => (
                <Button
                  key={example}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </Button>
              ))}
            </div>

            {/* Résultat */}
            {generatedLyrics && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label><TranslatedText text="Paroles générées" /></Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg max-h-48 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {generatedLyrics}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isGenerating}
            >
              <TranslatedText text="Fermer" />
            </Button>
            
            {generatedLyrics ? (
              <Button onClick={handleUse} className="gap-2">
                <Check className="h-4 w-4" />
                <TranslatedText text="Utiliser ces paroles" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <TranslatedText text="Génération..." />
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <TranslatedText text="Générer" />
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
