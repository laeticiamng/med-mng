import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Star, Send, MessageSquare, Bug, Lightbulb, 
  Heart, ThumbsUp, ThumbsDown, Flag 
} from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackSystemProps {
  context?: string;
  initialType?: 'general' | 'bug' | 'feature' | 'improvement';
}

export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ 
  context = 'general',
  initialType = 'general'
}) => {
  const [feedbackType, setFeedbackType] = useState(initialType);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { id: 'general', label: 'Général', icon: MessageSquare, color: 'bg-primary/10 text-primary' },
    { id: 'bug', label: 'Bug/Problème', icon: Bug, color: 'bg-destructive/10 text-destructive' },
    { id: 'feature', label: 'Nouvelle fonctionnalité', icon: Lightbulb, color: 'bg-warning/10 text-warning' },
    { id: 'improvement', label: 'Amélioration', icon: ThumbsUp, color: 'bg-success/10 text-success' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulation d'envoi de feedback
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Merci pour votre feedback !', {
        description: 'Nous avons bien reçu votre message et nous vous répondrons rapidement.'
      });
      
      // Reset form
      setMessage('');
      setRating(0);
      setEmail('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi', {
        description: 'Veuillez réessayer plus tard.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="medical-card w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Votre avis nous intéresse
        </CardTitle>
        <CardDescription>
          Aidez-nous à améliorer MED-MNG en partageant vos suggestions et commentaires
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Type de feedback */}
        <div>
          <Label className="medical-label">Type de feedback</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {feedbackTypes.map((type) => (
              <Button
                key={type.id}
                variant={feedbackType === type.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFeedbackType(type.id as any)}
                className="h-auto p-3 flex flex-col gap-1"
              >
                <type.icon className="w-4 h-4" />
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Évaluation par étoiles */}
        <div>
          <Label className="medical-label">Évaluez votre expérience</Label>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating 
                      ? 'fill-warning text-warning' 
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {rating === 5 ? 'Excellent !' : 
               rating === 4 ? 'Très bien' :
               rating === 3 ? 'Correct' :
               rating === 2 ? 'Peut mieux faire' : 
               'Décevant'}
            </p>
          )}
        </div>

        {/* Message */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="feedback-message" className="medical-label">
              Votre message *
            </Label>
            <Textarea
              id="feedback-message"
              placeholder="Décrivez votre expérience, suggestions d'amélioration, bugs rencontrés..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="medical-input resize-none"
            />
          </div>

          {/* Email optionnel */}
          <div>
            <Label htmlFor="feedback-email" className="medical-label">
              Email (optionnel)
            </Label>
            <Input
              id="feedback-email"
              type="email"
              placeholder="Pour vous répondre si nécessaire"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="medical-input"
            />
          </div>

          {/* Context info */}
          {context !== 'general' && (
            <div className="bg-muted/50 rounded-lg p-3">
              <Label className="text-xs text-muted-foreground">
                Contexte: {context}
              </Label>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="w-full medical-btn-primary"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Envoi en cours...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Envoyer le feedback
              </div>
            )}
          </Button>
        </form>

        {/* Quick actions */}
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-3">Actions rapides :</p>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => {
                setFeedbackType('feature');
                setMessage('J\'aimerais voir une nouvelle fonctionnalité : ');
              }}
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              Suggérer une fonctionnalité
            </Badge>
            
            <Badge 
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => {
                setFeedbackType('bug');
                setMessage('J\'ai rencontré un problème : ');
              }}
            >
              <Bug className="w-3 h-3 mr-1" />
              Signaler un bug
            </Badge>

            <Badge 
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => {
                setRating(5);
                setMessage('Excellente plateforme ! ');
              }}
            >
              <ThumbsUp className="w-3 h-3 mr-1" />
              Compliment
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};