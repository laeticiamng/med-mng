// AI-powered flashcard generator from free text
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import React, { useState } from 'react';

interface GeneratedCard {
  front: string;
  back: string;
  type: 'definition' | 'question' | 'concept';
}

interface AIFlashcardGeneratorProps {
  deckId: string;
  onCardsGenerated: () => void;
}

export const AIFlashcardGenerator: React.FC<AIFlashcardGeneratorProps> = ({
  deckId,
  onCardsGenerated,
}) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [cardCount, setCardCount] = useState('5');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const generateFlashcards = async () => {
    if (!text.trim() || text.length < 50) {
      toast({
        title: 'Texte insuffisant',
        description: 'Ajoutez au moins 50 caractères de contenu médical',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    setProgress(10);
    setGeneratedCards([]);

    try {
      setProgress(30);

      // Call AI to generate flashcards
      const { data, error } = await supabase.functions.invoke('medical-chat-ai', {
        body: {
          messages: [
            {
              role: 'system',
              content: `Tu es un expert en création de flashcards médicales pédagogiques. 
              
À partir du texte médical fourni, génère exactement ${cardCount} flashcards au format JSON.

Règles:
- Chaque flashcard doit avoir un "front" (question/terme) et un "back" (réponse/définition)
- Varie les types: définitions, questions cliniques, concepts clés
- Reste concis: max 2 phrases par côté
- Focus sur les points essentiels à retenir pour l'EDN

Réponds UNIQUEMENT avec un tableau JSON valide, sans texte autour:
[{"front": "...", "back": "...", "type": "definition"}, ...]`
            },
            {
              role: 'user',
              content: `Génère ${cardCount} flashcards à partir de ce texte médical:\n\n${text}`
            }
          ],
          model: 'google/gemini-2.5-flash'
        }
      });

      setProgress(70);

      if (error) throw error;

      // Parse the response
      let cards: GeneratedCard[] = [];
      try {
        const content = data.content || '';
        // Extract JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          cards = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('Impossible de parser les flashcards générées');
      }

      if (!cards.length) {
        throw new Error('Aucune flashcard générée');
      }

      setProgress(100);
      setGeneratedCards(cards);

      toast({
        title: '✅ Flashcards générées',
        description: `${cards.length} cartes créées avec succès`,
      });

    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: 'Erreur de génération',
        description: error.message || 'Impossible de générer les flashcards',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  const saveCards = async () => {
    if (!generatedCards.length || !deckId) return;

    setSaving(true);

    try {
      const cardsToInsert = generatedCards.map(card => ({
        deck_id: deckId,
        front_content: card.front,
        back_content: card.back,
        tags: [card.type, 'ai-generated'],
      }));

      const { error } = await supabase
        .from('flashcards')
        .insert(cardsToInsert);

      if (error) throw error;

      toast({
        title: '✅ Cartes sauvegardées',
        description: `${generatedCards.length} flashcards ajoutées au deck`,
      });

      setGeneratedCards([]);
      setText('');
      setOpen(false);
      onCardsGenerated();

    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: 'Erreur de sauvegarde',
        description: error.message || 'Impossible de sauvegarder les cartes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const removeCard = (index: number) => {
    setGeneratedCards(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wand2 className="h-4 w-4" />
          Génération IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Générer des flashcards avec l'IA
          </DialogTitle>
          <DialogDescription>
            Collez du contenu médical et l'IA créera des flashcards optimisées pour la mémorisation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Input Section */}
          {generatedCards.length === 0 && (
            <>
              <div className="space-y-2">
                <Label>Contenu médical à transformer</Label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Collez ici un extrait de cours, un article médical, ou des notes de révision..."
                  className="min-h-[200px] resize-none"
                  disabled={generating}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {text.length} caractères (minimum 50)
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Nombre de flashcards</Label>
                  <Select value={cardCount} onValueChange={setCardCount} disabled={generating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 cartes</SelectItem>
                      <SelectItem value="5">5 cartes</SelectItem>
                      <SelectItem value="10">10 cartes</SelectItem>
                      <SelectItem value="15">15 cartes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {generating && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Analyse du contenu et génération des flashcards...
                  </p>
                </div>
              )}

              <Button
                className="w-full gap-2"
                onClick={generateFlashcards}
                disabled={generating || text.length < 50}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Générer {cardCount} flashcards
                  </>
                )}
              </Button>
            </>
          )}

          {/* Preview Generated Cards */}
          {generatedCards.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{generatedCards.length} cartes générées</h3>
                <Button variant="ghost" size="sm" onClick={() => setGeneratedCards([])}>
                  Recommencer
                </Button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {generatedCards.map((card, index) => (
                  <Card key={index} className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeCard(index)}
                    >
                      ×
                    </Button>
                    <CardHeader className="pb-2 pt-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {card.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Carte {index + 1}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Recto</p>
                        <p className="text-sm font-medium">{card.front}</p>
                      </div>
                      <div className="border-t pt-3">
                        <p className="text-xs text-muted-foreground mb-1">Verso</p>
                        <p className="text-sm">{card.back}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setGeneratedCards([])}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={saveCards}
                  disabled={saving || generatedCards.length === 0}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      Ajouter {generatedCards.length} cartes au deck
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
