import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROUTE_PATHS } from '@/config/routes';
import { Loader2, Music } from 'lucide-react';
import { toast } from 'sonner';
import { traduireErreurAuth } from '@/lib/erreursAuth';
import { jetonPourLaPage } from '@/lib/jetonRecuperation';

type EtatLien = 'verification' | 'formulaire' | 'invalide' | 'indisponible';
type ResultatVerification = 'valide' | 'invalide' | 'transitoire';

/**
 * Refus définitif du jeton (expiré, déjà utilisé, inconnu) : réponse 4xx d'authentification, hors 429.
 * Tout le reste est transitoire : AuthRetryableFetchError, statut 0 ou absent, 5xx, 429, exception
 * réseau. Un lien encore valable ne doit jamais être déclaré périmé à cause d'une coupure.
 */
const refusDefinitif = (erreur: unknown): boolean => {
  const { name, status } = (erreur ?? {}) as { name?: unknown; status?: unknown };
  if (name === 'AuthRetryableFetchError') return false;
  return typeof status === 'number' && status >= 400 && status < 500 && status !== 429;
};

/**
 * Échanges de jeton déjà lancés, par token_hash. Un jeton de récupération ne sert qu'une fois :
 * un second appel (double montage de React.StrictMode, retour sur la page) le verrait « déjà utilisé ».
 * Ne restent en mémoire que le succès et le refus définitif de CE jeton ; un échec transitoire est
 * oublié dès qu'il est connu, pour que « Réessayer » relance vraiment l'échange.
 */
const verifications = new Map<string, Promise<ResultatVerification>>();

const verifierJeton = (tokenHash: string): Promise<ResultatVerification> => {
  let verification = verifications.get(tokenHash);
  if (!verification) {
    const lancee: Promise<ResultatVerification> = supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: 'recovery' })
      .then(({ error }): ResultatVerification => (!error ? 'valide' : refusDefinitif(error) ? 'invalide' : 'transitoire'))
      .catch((): ResultatVerification => 'transitoire');
    verification = lancee;
    verifications.set(tokenHash, lancee);
    void lancee.then((resultat) => {
      if (resultat === 'transitoire' && verifications.get(tokenHash) === lancee) verifications.delete(tokenHash);
    });
  }
  return verification;
};

export const MedMngResetPassword = () => {
  const { updatePassword } = useAuth();
  const { hash } = useLocation();
  // Lien actuel (e-mail de mm-password-reset) : …/reset-password#token_hash=…&type=recovery. Le jeton a
  // été lu puis retiré de l'adresse au démarrage (src/main.tsx → src/lib/jetonRecuperation.ts) : il
  // vient de la mémoire, jamais de l'adresse affichée, et « Réessayer » ne le remet pas dans l'adresse.
  // Repli : ancien parcours, où supabase-js lit la session dans le fragment (#access_token=…) et émet
  // PASSWORD_RECOVERY.
  const jeton = jetonPourLaPage();
  const tokenHash = jeton?.tokenHash ?? null;
  const lienActuel = Boolean(tokenHash) && jeton?.type === 'recovery';
  const lienIncomplet = Boolean(tokenHash) && !lienActuel;
  // Fragment d'erreur renvoyé par l'ancien parcours (#error=access_denied&error_code=otp_expired).
  const erreurDansFragment  = /(^|[#&])error(_code)?=/.test(hash);
  const [etatLien, setEtatLien] = useState<EtatLien>(
    lienIncomplet || erreurDansFragment ? 'invalide' : lienActuel ? 'verification' : 'formulaire',
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Incrémenté par « Réessayer » : relance l'échange du même jeton.
  const [tentative, setTentative] = useState(0);

  useEffect(() => {
    if (!lienActuel || !tokenHash) return;
    let actif = true;
    verifierJeton(tokenHash).then((resultat) => {
      if (!actif) return;
      if (resultat === 'transitoire') {
        // Le jeton est peut-être encore valable : il reste en mémoire pour pouvoir réessayer.
        setEtatLien('indisponible');
        return;
      }
      setEtatLien(resultat === 'valide' ? 'formulaire' : 'invalide');
    });
    return () => {
      actif = false;
    };
  }, [lienActuel, tokenHash, tentative]);

  const reessayer = () => {
    setEtatLien('verification');
    setTentative((n) => n + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      setError(traduireErreurAuth(error));
    } else {
      setSuccess(true);
      toast.success('Mot de passe mis à jour');
    }
  };

  if (success) {
    return <Navigate to={ROUTE_PATHS.medMngLogin} replace />;
  }

  if (etatLien !== 'formulaire') {
    const invalide = etatLien === 'invalide';
    const indisponible = etatLien === 'indisponible';
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Music className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Med MNG</span>
            </div>
            <h1 className="text-xl font-semibold leading-none tracking-tight">
              {invalide ? 'Lien expiré ou déjà utilisé' : indisponible ? 'Connexion impossible pour le moment' : 'Vérification du lien'}
            </h1>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {indisponible ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Nous n'avons pas pu vérifier votre lien. Il est peut-être encore valable : vérifiez votre connexion puis réessayez.
                </p>
                <Button type="button" className="w-full" onClick={reessayer}>
                  Réessayer
                </Button>
              </>
            ) : invalide ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Ce lien de réinitialisation n'est plus valable. Demandez-en un nouveau : il reste utilisable pendant 1 heure, une seule fois.
                </p>
                <Button asChild className="w-full">
                  <Link to={`${ROUTE_PATHS.medMngLogin}?mdp=oublie`}>Demander un nouveau lien</Link>
                </Button>
              </>
            ) : (
              <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Vérification en cours…
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Med MNG</span>
          </div>
          <h1 className="text-xl font-semibold leading-none tracking-tight">Nouveau mot de passe</h1>
          <CardDescription>Choisissez votre nouveau mot de passe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};