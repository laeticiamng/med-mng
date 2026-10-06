import { Flag, Loader2 } from 'lucide-react';
import React, { useId, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  LIBELLES_CONTENU_SIGNALE,
  MESSAGE_SIGNALEMENT_MAX,
  MESSAGE_SIGNALEMENT_MIN,
  SIGNALEMENTS_PAR_JOUR_MAX,
  type TypeContenuSignale,
} from '@/config/mentionsContenu';
import { ROUTE_PATHS } from '@/config/routes';
import { avecSuivant } from '@/lib/cheminSuivant';
import { envoyerSignalement } from '@/lib/signalementsContenu';

interface SignalerErreurProps {
  itemCode: string;
  typeContenu: TypeContenuSignale;
  /** Partie précise du contenu (chapitre, planche…), jointe au signalement. */
  reference?: string | null;
}

const MESSAGES_ECHEC = {
  limite: `Vous avez atteint la limite de ${SIGNALEMENTS_PAR_JOUR_MAX} signalements par jour. Réessayez demain.`,
  session:
    'Votre session a expiré : reconnectez-vous, puis renvoyez votre signalement.',
  erreur:
    "Le signalement n'a pas pu être envoyé. Vérifiez votre connexion et réessayez.",
} as const;

/**
 * Bouton « Signaler une erreur » (CF-10, décision CEO du 06.10.2026).
 * Compte connecté : formulaire en boîte de dialogue. Visiteur : lien de connexion
 * qui ramène sur la page.
 */
export const SignalerErreur: React.FC<SignalerErreurProps> = ({
  itemCode,
  typeContenu,
  reference,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const idChamp = useId();
  const idAide = useId();
  const [ouvert, setOuvert] = useState(false);
  const [message, setMessage] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [echec, setEchec] = useState<string | null>(null);

  if (loading) return null;

  if (!user) {
    return (
      <Link
        to={avecSuivant(
          ROUTE_PATHS.medMngLogin,
          `${location.pathname}${location.search ?? ''}`
        )}
        className="inline-flex items-center gap-1 text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground"
      >
        <Flag className="h-3 w-3" aria-hidden="true" />
        Se connecter pour signaler une erreur
      </Link>
    );
  }

  const longueur = message.trim().length;
  const valide =
    longueur >= MESSAGE_SIGNALEMENT_MIN && longueur <= MESSAGE_SIGNALEMENT_MAX;
  const libelle = LIBELLES_CONTENU_SIGNALE[typeContenu];

  const changerOuverture = (o: boolean) => {
    setOuvert(o);
    if (!o) {
      // Après un envoi réussi, le formulaire repart vide ; sinon le brouillon est gardé.
      if (envoye) setMessage('');
      setEnvoye(false);
      setEchec(null);
    }
  };

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valide || envoi) return;
    setEnvoi(true);
    setEchec(null);
    const resultat = await envoyerSignalement({
      itemCode,
      typeContenu,
      reference,
      message,
    });
    setEnvoi(false);
    if ('raison' in resultat) setEchec(MESSAGES_ECHEC[resultat.raison]);
    else setEnvoye(true);
  };

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 gap-1 text-xs"
        onClick={() => setOuvert(true)}
      >
        <Flag className="h-3 w-3" aria-hidden="true" />
        Signaler une erreur
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Signaler une erreur</DialogTitle>
          <DialogDescription>
            {itemCode} · {libelle}
            {reference ? ` · ${reference}` : ''}. Décrivez ce qui vous paraît
            inexact et, si possible, la source officielle qui le contredit.
          </DialogDescription>
        </DialogHeader>

        {envoye ? (
          <div className="space-y-4">
            <p role="status" className="text-sm text-foreground">
              Merci, votre signalement sera examiné.
            </p>
            <DialogFooter>
              <Button type="button" onClick={() => changerOuverture(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={envoyer} className="space-y-3" noValidate>
            <div className="space-y-1">
              <Label htmlFor={idChamp}>Votre message</Label>
              <Textarea
                id={idChamp}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={MESSAGE_SIGNALEMENT_MAX}
                rows={5}
                required
                aria-describedby={idAide}
                aria-invalid={message.length > 0 && !valide ? true : undefined}
              />
              <p id={idAide} className="text-xs text-muted-foreground">
                Entre {MESSAGE_SIGNALEMENT_MIN} et {MESSAGE_SIGNALEMENT_MAX}{' '}
                caractères ({longueur}/{MESSAGE_SIGNALEMENT_MAX}).
              </p>
            </div>
            {echec && (
              <p role="alert" className="text-sm text-destructive">
                {echec}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => changerOuverture(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={!valide || envoi}>
                {envoi && (
                  <Loader2
                    className="h-4 w-4 mr-1 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Envoyer le signalement
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
