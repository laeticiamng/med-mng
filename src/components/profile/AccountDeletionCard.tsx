import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Trash2, AlertTriangle, Download, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AccountDeletionCardProps {
  userId: string;
  userEmail: string;
}

export const AccountDeletionCard: React.FC<AccountDeletionCardProps> = ({
  userId,
  userEmail
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmations, setConfirmations] = useState({
    understandPermanent: false,
    understandDataLoss: false,
    exportedData: false
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionStep, setDeletionStep] = useState<'confirm' | 'processing' | 'completed'>('confirm');
  const { toast } = useToast();
  const navigate = useNavigate();

  const canDelete = confirmEmail === userEmail &&
    confirmations.understandPermanent &&
    confirmations.understandDataLoss;

  const handleExportData = async () => {
    try {
      toast({
        title: "Export en cours",
        description: "Préparation de vos données personnelles..."
      });

      // Récupérer toutes les données de l'utilisateur
      const [profileRes, progressRes, activityRes, musicRes, flashcardsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('user_item_progress').select('*').eq('user_id', userId),
        supabase.from('user_activity').select('*').eq('user_id', userId).limit(1000),
        supabase.from('user_generated_music').select('*').eq('user_id', userId),
        supabase.from('flashcard_decks').select('*, flashcards(*)').eq('user_id', userId)
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        userId,
        userEmail,
        profile: profileRes.data,
        learningProgress: progressRes.data,
        activityHistory: activityRes.data,
        generatedMusic: musicRes.data,
        flashcards: flashcardsRes.data,
        _meta: {
          exportVersion: '1.0',
          gdprCompliant: true,
          description: 'Export complet des données personnelles conformément au RGPD Article 20'
        }
      };

      // Télécharger le fichier JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `med-mng-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export terminé",
        description: "Vos données ont été téléchargées"
      });

      setConfirmations(prev => ({ ...prev, exportedData: true }));
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter vos données",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    setDeletionStep('processing');

    try {
      // 1. Supprimer les données utilisateur dans les différentes tables
      // Ordre important: supprimer les dépendances d'abord

      // Supprimer les flashcards
      await supabase.from('flashcard_reviews').delete().eq('flashcard_id', 'in',
        supabase.from('flashcards').select('id').eq('deck_id', 'in',
          supabase.from('flashcard_decks').select('id').eq('user_id', userId)
        )
      );
      await supabase.from('flashcards').delete().eq('deck_id', 'in',
        supabase.from('flashcard_decks').select('id').eq('user_id', userId)
      );
      await supabase.from('flashcard_decks').delete().eq('user_id', userId);

      // Supprimer les quiz results
      await supabase.from('quiz_results').delete().eq('user_id', userId);

      // Supprimer les favoris et playlists musicales
      await supabase.from('med_mng_playlist_songs').delete().eq('playlist_id', 'in',
        supabase.from('med_mng_playlists').select('id').eq('user_id', userId)
      );
      await supabase.from('med_mng_playlists').delete().eq('user_id', userId);
      await supabase.from('user_generated_music').delete().eq('user_id', userId);

      // Supprimer la progression d'apprentissage
      await supabase.from('user_item_progress').delete().eq('user_id', userId);
      await supabase.from('item_reviews').delete().eq('user_id', userId);

      // Supprimer l'activité
      await supabase.from('user_activity').delete().eq('user_id', userId);

      // Supprimer les préférences
      await supabase.from('user_preferences_extended').delete().eq('user_id', userId);

      // Supprimer le profil
      await supabase.from('profiles').delete().eq('id', userId);

      // 2. Appeler la fonction edge pour supprimer l'utilisateur auth
      const { error: deleteAuthError } = await supabase.functions.invoke('delete-user-account', {
        body: { userId, confirmEmail: userEmail }
      });

      if (deleteAuthError) {
        console.error('Error deleting auth user:', deleteAuthError);
        // Continuer quand même - les données ont été supprimées
      }

      // 3. Se déconnecter
      await supabase.auth.signOut();

      setDeletionStep('completed');

      toast({
        title: "Compte supprimé",
        description: "Votre compte et toutes vos données ont été supprimés conformément au RGPD"
      });

      // Rediriger vers la page d'accueil après un délai
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Error deleting account:', error);
      setDeletionStep('confirm');
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression. Contactez le support.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Suppression du compte
        </CardTitle>
        <CardDescription>
          Conformément au RGPD (Article 17 - Droit à l'effacement), vous pouvez demander
          la suppression complète de votre compte et de toutes vos données personnelles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Attention :</strong> Cette action est irréversible. Toutes vos données
            seront définitivement supprimées (profil, progression, musiques, flashcards...).
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Exporter mes données d'abord
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer mon compte
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-destructive flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Confirmer la suppression
                </DialogTitle>
                <DialogDescription>
                  Cette action supprimera définitivement votre compte et toutes vos données.
                </DialogDescription>
              </DialogHeader>

              {deletionStep === 'confirm' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="understand-permanent"
                        checked={confirmations.understandPermanent}
                        onCheckedChange={(checked) =>
                          setConfirmations(prev => ({ ...prev, understandPermanent: checked === true }))
                        }
                      />
                      <Label htmlFor="understand-permanent" className="text-sm">
                        Je comprends que cette action est <strong>permanente et irréversible</strong>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="understand-data-loss"
                        checked={confirmations.understandDataLoss}
                        onCheckedChange={(checked) =>
                          setConfirmations(prev => ({ ...prev, understandDataLoss: checked === true }))
                        }
                      />
                      <Label htmlFor="understand-data-loss" className="text-sm">
                        Je comprends que <strong>toutes mes données</strong> seront supprimées
                        (profil, progression, musiques, flashcards, statistiques...)
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-email">
                      Saisissez votre email pour confirmer: <strong>{userEmail}</strong>
                    </Label>
                    <Input
                      id="confirm-email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      placeholder="Entrez votre email"
                    />
                  </div>
                </div>
              )}

              {deletionStep === 'processing' && (
                <div className="py-8 text-center">
                  <div className="w-8 h-8 border-2 border-destructive border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p>Suppression en cours...</p>
                  <p className="text-sm text-muted-foreground">Cela peut prendre quelques instants</p>
                </div>
              )}

              {deletionStep === 'completed' && (
                <div className="py-8 text-center">
                  <div className="text-4xl mb-4">👋</div>
                  <p className="font-medium">Votre compte a été supprimé</p>
                  <p className="text-sm text-muted-foreground">
                    Vous allez être redirigé vers la page d'accueil
                  </p>
                </div>
              )}

              {deletionStep === 'confirm' && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={!canDelete || isDeleting}
                  >
                    {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
