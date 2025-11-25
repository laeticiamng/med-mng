import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Save,
  X,
  Tag,
  Layers,
  BookOpen,
  Trash2,
  Edit,
  Copy,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useFlashcards,
  useFlashcardDecks,
  useCreateFlashcard,
  useUpdateFlashcard,
  useDeleteFlashcard,
  useCreateDeck,
  Flashcard,
  FlashcardDeck,
} from '@/hooks/useFlashcards';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FlashcardEditorProps {
  className?: string;
  deckId?: string;
  itemNumber?: string;
  onCardCreated?: (card: Flashcard) => void;
}

interface CardFormData {
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  deck_id?: string;
  item_number?: string;
}

const emptyFormData: CardFormData = {
  front: '',
  back: '',
  difficulty: 'medium',
  tags: [],
};

export const FlashcardEditor: React.FC<FlashcardEditorProps> = ({
  className,
  deckId,
  itemNumber,
  onCardCreated,
}) => {
  const { data: decks } = useFlashcardDecks();
  const { data: cards, isLoading } = useFlashcards(deckId);
  const createFlashcard = useCreateFlashcard();
  const updateFlashcard = useUpdateFlashcard();
  const deleteFlashcard = useDeleteFlashcard();
  const createDeck = useCreateDeck();

  const [isOpen, setIsOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [formData, setFormData] = useState<CardFormData>({
    ...emptyFormData,
    deck_id: deckId,
    item_number: itemNumber,
  });
  const [tagInput, setTagInput] = useState('');
  const [showDeckDialog, setShowDeckDialog] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        ...emptyFormData,
        deck_id: deckId,
        item_number: itemNumber,
      });
      setEditingCard(null);
      setTagInput('');
    }
  }, [isOpen, deckId, itemNumber]);

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setFormData({
      front: card.front,
      back: card.back,
      difficulty: card.difficulty,
      tags: card.tags || [],
      deck_id: card.deck_id,
      item_number: card.item_number,
    });
    setIsOpen(true);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.front.trim() || !formData.back.trim()) {
      toast.error('Veuillez remplir le recto et le verso');
      return;
    }

    try {
      if (editingCard) {
        await updateFlashcard.mutateAsync({
          id: editingCard.id,
          updates: {
            front: formData.front,
            back: formData.back,
            difficulty: formData.difficulty,
            tags: formData.tags,
            deck_id: formData.deck_id,
          },
        });
        toast.success('Flashcard mise à jour');
      } else {
        const newCard = await createFlashcard.mutateAsync({
          front: formData.front,
          back: formData.back,
          difficulty: formData.difficulty,
          tags: formData.tags,
          deck_id: formData.deck_id,
          item_number: formData.item_number,
        });
        toast.success('Flashcard créée');
        onCardCreated?.(newCard);
      }
      setIsOpen(false);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFlashcard.mutateAsync(id);
      toast.success('Flashcard supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDuplicateCard = (card: Flashcard) => {
    setEditingCard(null);
    setFormData({
      front: card.front,
      back: card.back,
      difficulty: card.difficulty,
      tags: card.tags || [],
      deck_id: card.deck_id,
      item_number: card.item_number,
    });
    setIsOpen(true);
  };

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) {
      toast.error('Veuillez entrer un nom pour le deck');
      return;
    }

    try {
      const deck = await createDeck.mutateAsync({
        name: newDeckName,
        is_public: false,
      });
      setFormData((prev) => ({ ...prev, deck_id: deck.id }));
      setShowDeckDialog(false);
      setNewDeckName('');
      toast.success('Deck créé');
    } catch (error) {
      toast.error('Erreur lors de la création du deck');
    }
  };

  return (
    <div className={className}>
      {/* Create button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle flashcard
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Modifier la flashcard' : 'Créer une flashcard'}
            </DialogTitle>
            <DialogDescription>
              {editingCard
                ? 'Modifiez les informations de la flashcard'
                : 'Créez une nouvelle flashcard pour votre révision'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Front */}
            <div className="space-y-2">
              <Label htmlFor="front">Recto (Question)</Label>
              <Textarea
                id="front"
                placeholder="Entrez la question..."
                value={formData.front}
                onChange={(e) => setFormData((prev) => ({ ...prev, front: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Back */}
            <div className="space-y-2">
              <Label htmlFor="back">Verso (Réponse)</Label>
              <Textarea
                id="back"
                placeholder="Entrez la réponse..."
                value={formData.back}
                onChange={(e) => setFormData((prev) => ({ ...prev, back: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Difficulté</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                  setFormData((prev) => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deck */}
            <div className="space-y-2">
              <Label>Deck</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.deck_id || ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, deck_id: value || undefined }))
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Aucun deck" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun deck</SelectItem>
                    {decks?.map((deck) => (
                      <SelectItem key={deck.id} value={deck.id}>
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          {deck.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => setShowDeckDialog(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button variant="outline" size="icon" onClick={handleAddTag}>
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive/20"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Item number */}
            {formData.item_number && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Lié à l'item {formData.item_number}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createFlashcard.isPending || updateFlashcard.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {editingCard ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create deck dialog */}
      <Dialog open={showDeckDialog} onOpenChange={setShowDeckDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau deck</DialogTitle>
            <DialogDescription>Créez un nouveau deck pour organiser vos flashcards</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="deck-name">Nom du deck</Label>
            <Input
              id="deck-name"
              placeholder="Ex: Cardiologie..."
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateDeck();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeckDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateDeck} disabled={createDeck.isPending}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cards list */}
      {cards && cards.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {cards.length} flashcard{cards.length > 1 ? 's' : ''}
          </h3>
          <div className="space-y-2">
            {cards.map((card) => (
              <Card key={card.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{card.front}</p>
                      <p className="text-sm text-muted-foreground truncate">{card.back}</p>
                      {card.tags && card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {card.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditCard(card)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateCard(card)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(card.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardEditor;
