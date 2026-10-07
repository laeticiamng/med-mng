import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Database,
    Download,
    Info,
    Shield,
    Trash2
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PremiumPageLayout } from '@/components/layout/PremiumPageLayout';
import { useSubscription } from '@/hooks/useSubscription';
import { lireRefusSuppression } from '@/lib/suppressionCompte';

const MesDonneesRGPD = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dataStatus, setDataStatus] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  /** Refus « abonnement encore prélevable » (409) : message du service à afficher. */
  const [refusAbonnement, setRefusAbonnement] = useState<string | null>(null);

  const { abonnementPrelevable, openCustomerPortal } = useSubscription();

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  /**
   * Lecture directe, sous RLS, des données rattachées au compte connecté.
   * (L'ancienne route « med-mng-api /rgpd/* » n'était jamais atteinte : le chemin
   * était passé dans le corps de la requête, et le service n'avait pas de client base.)
   * Une table absente ou refusée est simplement ignorée.
   */
  const collectUserData = async (userId: string) => {
    // Tables personnelles écrites par Med MNG, noms et colonne propriétaire
    // vérifiés en production le 07.10.2026 (MM-A14). L'abonnement est dans
    // user_subscriptions (source de useSubscription et du webhook Stripe), pas
    // dans med_mng_subscriptions.
    const tables: Array<[string, string]> = [
      ['profiles', 'id'],
      ['user_subscriptions', 'user_id'],
      ['user_onboarding', 'user_id'],
      ['user_preferences_extended', 'user_id'],
      ['user_notification_settings', 'user_id'],
      // Progression
      ['user_item_progress', 'user_id'],
      ['item_reviews', 'user_id'],
      ['review_sessions', 'user_id'],
      ['revision_history', 'user_id'],
      ['quiz_results', 'user_id'],
      ['quiz_sessions', 'user_id'],
      ['user_progress', 'user_id'],
      ['study_sessions', 'user_id'],
      // Contenus et favoris
      ['user_edn_notes', 'user_id'],
      ['user_edn_favorites', 'user_id'],
      ['med_mng_user_favorites', 'user_id'],
      ['mm_signalements_contenu', 'user_id'],
      ['flashcard_decks', 'user_id'],
      ['flashcard_reviews', 'user_id'],
      // Musique
      ['mm_generations_audio', 'user_id'],
      ['generated_music_tracks', 'user_id'],
      ['med_mng_songs', 'user_id'],
      ['med_mng_user_songs', 'user_id'],
      ['med_mng_playlists', 'user_id'],
      ['user_generated_music', 'user_id'],
      // Points, badges et journal d'activité
      ['gamification_activities', 'user_id'],
      ['user_gamification_stats', 'user_id'],
      ['user_badges', 'user_id'],
      ['user_activity_log', 'user_id'],
    ];
    const data: Record<string, unknown[]> = {};
    const summary: Record<string, number> = {};
    for (const [table, column] of tables) {
      try {
        const { data: rows, error } = await (supabase as any).from(table).select('*').eq(column, userId);
        if (error || !rows) continue;
        data[table] = rows;
        summary[table] = rows.length;
      } catch {
        // table inexistante : ignorée
      }
    }
    // Les cartes n'ont pas de colonne user_id : ce sont celles des paquets du compte.
    const idsPaquets = ((data.flashcard_decks ?? []) as Array<{ id?: string }>)
      .map((d) => d.id)
      .filter((id): id is string => Boolean(id));
    if (idsPaquets.length > 0) {
      try {
        const { data: cartes, error } = await (supabase as any).from('flashcards').select('*').in('deck_id', idsPaquets);
        if (!error && cartes) {
          data.flashcards = cartes;
          summary.flashcards = cartes.length;
        }
      } catch {
        // table inexistante : ignorée
      }
    }
    return { data, summary };
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast({ title: "Erreur", description: "Vous devez être connecté", variant: "destructive" });
        return;
      }
      const { data, summary } = await collectUserData(user.id);
      const payload = {
        exported_at: new Date().toISOString(),
        service: 'Med MNG — EmotionsCare SASU',
        account: { id: user.id, email: user.email, created_at: user.created_at },
        data,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medmng-donnees-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      const total = Object.values(summary).reduce((n, v) => n + v, 0);
      toast({ title: "Export prêt", description: `${total} enregistrement(s) exporté(s).` });
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Erreur export:', error);
      toast({ title: "Erreur", description: "Impossible d'exporter les données. Écrivez-nous à contact@emotionscare.com.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setLoading(true);
    setRefusAbonnement(null);
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast({ title: "Erreur", description: "Vous devez être connecté", variant: "destructive" });
        return;
      }

      // Service commun de suppression (RGPD art. 17) : efface les données personnelles,
      // les fichiers rangés sous l'identifiant du compte, puis le compte lui-même.
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        body: { confirmation: 'SUPPRIMER' },
      });
      if (error) {
        // Refus motivé par le service (rien n'a été supprimé) : on affiche son message.
        const refus = await lireRefusSuppression(error);
        if (refus) {
          if (refus.status === 409 && refus.code === 'active_subscription') {
            setRefusAbonnement(refus.message);
            setConfirmDelete(false);
          }
          toast({ title: "Suppression impossible pour l'instant", description: refus.message, variant: "destructive" });
          return;
        }
        throw error;
      }

      if (data?.status === 'deleted') {
        toast({ title: "Compte supprimé", description: "Votre compte et vos données personnelles ont été effacés." });
      } else {
        toast({
          title: "Demande enregistrée",
          description: "La suppression n'a pas pu se terminer automatiquement : elle sera finalisée à la main par notre équipe.",
        });
      }
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Erreur suppression:', error);
      toast({
        title: "La suppression n'a pas abouti",
        description: "Réessayez dans quelques minutes, ou écrivez à contact@emotionscare.com : nous supprimerons votre compte à la main.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckDataStatus = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast({ title: "Erreur", description: "Vous devez être connecté", variant: "destructive" });
        return;
      }
      const { summary } = await collectUserData(user.id);
      setDataStatus({ account_created: user.created_at, data_summary: summary, last_activity: user.last_sign_in_at });
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Erreur statut:', error);
      toast({ title: "Erreur", description: "Impossible de vérifier vos données", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumPageLayout gradient="default" showOrbs={true}>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to={ROUTE_PATHS.medMngProfile} className="flex items-center space-x-2 text-primary hover:text-primary/80">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour au profil</span>
            </Link>
            <div className="h-6 border-l border-border" />
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mes Données RGPD</h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Info RGPD */}
          <Alert className="bg-primary/10 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              Conformément au RGPD (Articles 15, 17, 20), vous pouvez accéder, exporter ou supprimer vos données personnelles à tout moment.
            </AlertDescription>
          </Alert>

          {/* Vos droits */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Database className="h-5 w-5 text-success" />
              <span>Vos Droits RGPD</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-success/10 p-4 rounded-lg">
                <h3 className="font-semibold text-success mb-2">✅ Droit d'accès (Art. 15)</h3>
                <p className="text-sm text-muted-foreground">Consulter toutes vos données personnelles</p>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">📥 Droit à la portabilité (Art. 20)</h3>
                <p className="text-sm text-muted-foreground">Exporter vos données au format JSON</p>
              </div>
              <div className="bg-warning/10 p-4 rounded-lg">
                <h3 className="font-semibold text-warning-foreground mb-2">🗑️ Droit à l'effacement (Art. 17)</h3>
                <p className="text-sm text-muted-foreground">Supprimer définitivement votre compte</p>
              </div>
              <div className="bg-accent/10 p-4 rounded-lg">
                <h3 className="font-semibold text-accent mb-2">✏️ Droit de rectification (Art. 16)</h3>
                <p className="text-sm text-muted-foreground">Modifier vos informations dans votre profil</p>
              </div>
            </div>
          </Card>

          {/* Statut des données */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Statut de vos données</h2>
            <Button 
              onClick={handleCheckDataStatus} 
              disabled={loading}
              className="mb-4"
            >
              {loading ? 'Vérification...' : 'Vérifier mes données'}
            </Button>

            {dataStatus && (
              <div className="space-y-3">
                <Alert className="bg-success/10 border-success/20">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription>
                    <strong>Compte actif depuis:</strong> {new Date(dataStatus.account_created).toLocaleDateString('fr-FR')}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {Object.entries(dataStatus.data_summary || {}).map(([table, count]: [string, any]) => (
                    <div key={table} className="bg-muted p-3 rounded">
                      <p className="font-semibold text-muted-foreground">{table}</p>
                      <p className="text-2xl font-bold text-primary">{count}</p>
                    </div>
                  ))}
                </div>

                {dataStatus.last_activity && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Dernière activité:</strong> {new Date(dataStatus.last_activity).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Export de données */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Download className="h-5 w-5 text-primary" />
              <span>Exporter mes données</span>
            </h2>
            <p className="text-muted-foreground mb-4">
              Téléchargez toutes vos données personnelles au format JSON structuré. Inclut : compte, profil, abonnement, progression, quiz, bibliothèque et playlists.
            </p>
            <Alert className="mb-4 bg-primary/10 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                <strong>Format:</strong> JSON (lisible par machine, conforme Article 20 RGPD)<br/>
                <strong>Durée:</strong> Export instantané<br/>
                <strong>Sécurité :</strong> fichier généré dans votre navigateur, rien n'est envoyé ailleurs
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleExportData} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{loading ? 'Export en cours...' : 'Télécharger mes données'}</span>
            </Button>
          </Card>

          {/* Suppression de compte */}
          <Card className="p-6 border-destructive/20 bg-destructive/5">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              <span>Supprimer mon compte</span>
            </h2>
            <Alert className="mb-4 bg-destructive/10 border-destructive/30">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>⚠️ ATTENTION: Action irréversible</strong><br/>
                La suppression de votre compte entraînera:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Suppression immédiate de vos données personnelles et de votre bibliothèque (chansons, quiz, playlists)</li>
                  <li>Aucune récupération possible ensuite</li>
                  <li>Votre compte est commun aux services d'EmotionsCare SASU qui partagent la même connexion (Med MNG, Emotions Care) : il sera supprimé partout</li>
                </ul>
              </AlertDescription>
            </Alert>

            {refusAbonnement && (
              <Alert role="alert" aria-labelledby="refus-suppression-titre" className="mb-4 bg-warning/10 border-warning/30">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-foreground space-y-3">
                  <p id="refus-suppression-titre" className="font-semibold">Suppression impossible pour l'instant</p>
                  <p>{refusAbonnement}</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => openCustomerPortal()}>
                    Gérer mon abonnement
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {abonnementPrelevable && !refusAbonnement && (
              <Alert className="mb-4 bg-warning/10 border-warning/30">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-foreground space-y-3">
                  <p>
                    Vous avez un abonnement Med MNG en cours ou un paiement en attente. Supprimer le compte n'arrête pas le prélèvement :
                    résiliez d'abord l'abonnement (si ce n'est pas déjà fait), puis revenez ici. La suppression est refusée tant
                    qu'un prélèvement reste possible.
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => openCustomerPortal()}>
                    Gérer mon abonnement
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {!confirmDelete ? (
              <Button 
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Demander la suppression</span>
              </Button>
            ) : (
              <div className="space-y-3">
                <Alert className="bg-warning/10 border-warning/30">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-warning-foreground">
                    <strong>Confirmer la suppression définitive?</strong><br/>
                    Cette action ne peut pas être annulée.
                  </AlertDescription>
                </Alert>
                <div className="flex space-x-3">
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{loading ? 'Suppression...' : 'Oui, supprimer définitivement'}</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setConfirmDelete(false)}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Contact */}
          <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
            <h2 className="text-xl font-semibold mb-4">📧 Besoin d'aide?</h2>
            <p className="text-muted-foreground mb-3">
              Pour toute question sur vos données personnelles ou l'exercice de vos droits RGPD:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>E-mail :</strong> contact@emotionscare.com</p>
              <p><strong>Délai de réponse :</strong> un mois au plus (article 12 du RGPD)</p>
              <p><strong>CNIL:</strong> En cas de litige, vous pouvez saisir la <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:decoration-2">CNIL</a></p>
            </div>
          </Card>
        </div>
      </div>
    </PremiumPageLayout>
  );
};

export default MesDonneesRGPD;