import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
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

type EtatLien = 'verification' | 'formulaire' | 'invalide';

/**
 * Échanges de jeton déjà lancés, par token_hash. Un jeton de récupération ne sert qu'une fois :
 * un second appel (double montage de React.StrictMode, retour sur la page) le verrait « déjà utilisé ».
 */
const verifications = new Map<string, Promise<boolean>>();

const verifierJeton = (tokenHash: string): Promise<boolean> => {
  let verification = verifications.get(tokenHash);
  if (!verification) {
    verification = supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: 'recovery' })
      .then(({ error }) => !error)
      .catch(() => false);
    verifications.set(tokenHash, verification);
  }
  return verification;
};

export const MedMngResetPassword = () => {
  const { updatePassword } = useAuth();
  const [searchParams] = useSearchParams();
  const { hash } = useLocation();
  // Lien actuel (e-mail de mm-password-reset) : ?token_hash=…&type=recovery. Repli : ancien parcours,
  // où supabase-js lit la session dans le fragment (#access_token=…) et émet PASSWORD_RECOVERY.
  const tokenHash = searchParams.get('token_hash');
  const lienActuel = Boolean(tokenHash) && searchParams.get('type') === 'recovery';
  const lienIncomplet = Boolean(tokenHash) && !lienActuel;
  // Fragment d'erreur renvoyé par l'ancien parcours (#error=access_denied&error_code=otp_expired).
  const erreurDansFragment =/(^|[#&])error(_code)?=/.test(hash);
  const [etatLien, setEtatLien] = useState<EtatLien>(
    lienIncomplet || erreurDansFragment ? 'invalide' : lienActuel ? 'verification' : 'formulaire',
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!lienActuel || !tokenHash) return;
    let actif = true;
    verifierJeton(tokenHash).then((valide) => {
      if (!actif) return;
      setEtatLien(valide ? 'formulaire' : 'invalide');
      // Le jeton n'a plus rien à faire dans l'adresse (historique, en-tête Referer).
      try {
        window.history.replaceState(window.history.state, '', window.location.pathname);
      } catch {
        // sans importance
      }
    });
    return () => {
      actif = false;
    };
  }, [lienActuel, tokenHash]);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Music className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Med MNG</span>
            </div>
            <h1 className="text-xl font-semibold leading-none tracking-tight">
              {invalide ? 'Lien expiré ou déjà utilisé' : 'Vérification du lien'}
            </h1>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {invalide ? (
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