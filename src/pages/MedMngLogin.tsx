import { useAuth } from '@/components/med-mng/AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { RateLimitPresets, useRateLimiting } from '@/hooks/useRateLimiting';
import { AlertTriangle, ArrowLeft, Clock, Music } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'sonner';

export const MedMngLogin = () => {
  const { user, signIn, signInWithGoogle, signInWithFacebook, signInWithApple, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [blockTimeDisplay, setBlockTimeDisplay] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { logActivity } = useActivityTracking();

  // Rate limiting pour les tentatives de connexion
  const {
    isBlocked,
    recordAttempt,
    recordSuccess,
    formatBlockTime,
  } = useRateLimiting('login', RateLimitPresets.login);

  // Mettre à jour l'affichage du temps de blocage
  useEffect(() => {
    if (isBlocked()) {
      const interval = setInterval(() => {
        const time = formatBlockTime();
        setBlockTimeDisplay(time);
        if (!time) {
          setError('');
          setWarning('');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isBlocked, formatBlockTime]);

  if (user) {
    return <Navigate to={ROUTE_PATHS.medMngMusicLibrary} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier le rate limiting
    if (isBlocked()) {
      setError(`Trop de tentatives. Réessayez dans ${formatBlockTime()}`);
      return;
    }

    // Enregistrer la tentative
    const attemptResult = recordAttempt();
    if (!attemptResult.allowed) {
      setError(attemptResult.message);
      return;
    }

    // Afficher un avertissement si peu de tentatives restantes
    if (attemptResult.message) {
      setWarning(attemptResult.message);
    } else {
      setWarning('');
    }

    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      // Réinitialiser le rate limiting en cas de succès
      recordSuccess();
      setWarning('');
      logActivity({ activity_type: 'study', metadata: { action: 'login_success', method: 'email' } });
    }

    setLoading(false);
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
    setError('');
    let result;
    
    switch (provider) {
      case 'google':
        result = await signInWithGoogle();
        break;
      case 'facebook':
        result = await signInWithFacebook();
        break;
      case 'apple':
        result = await signInWithApple();
        break;
    }
    
    if (result.error) {
      setError(result.error.message);
    } else {
      logActivity({ activity_type: 'study', metadata: { action: 'login_success', method: provider } });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    const { error } = await resetPassword(resetEmail);
    setResetLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Email de réinitialisation envoyé !', { description: 'Vérifiez votre boîte de réception.' });
      setShowForgotPassword(false);
      setResetEmail('');
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Music className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">MED-MNG</span>
            </div>
            <CardDescription>Réinitialisation du mot de passe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Entrez votre email pour recevoir un lien de réinitialisation.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input id="reset-email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} autoComplete="email" required />
              </div>
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? 'Envoi...' : 'Envoyer le lien'}
              </Button>
            </form>
            <Button variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la connexion
            </Button>
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
            <span className="text-2xl font-bold text-foreground">MED-MNG</span>
          </div>
          <CardDescription>Connectez-vous à votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alerte de blocage rate limiting */}
          {isBlocked() && (
            <Alert variant="destructive" className="border-destructive">
              <Clock className="h-4 w-4" />
              <AlertDescription className="flex items-center gap-2">
                <span>Compte temporairement bloqué. Réessayez dans</span>
                <strong>{blockTimeDisplay}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Avertissement de tentatives restantes */}
          {warning && !isBlocked() && (
            <Alert variant="default" className="border-warning bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning">{warning}</AlertDescription>
            </Alert>
          )}

          {/* Erreur standard */}
          {error && !isBlocked() && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading || isBlocked()}>
              {loading ? 'Connexion...' : isBlocked() ? `Bloqué (${blockTimeDisplay})` : 'Se connecter'}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Ou continuez avec</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
            className="w-full"
          >
            Google
          </Button>
          
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
              }}
              className="text-primary hover:underline"
            >
              Mot de passe oublié ?
            </button>
          </div>

          <div className="text-center text-sm">
            Pas encore de compte ?{' '}
            <Link to={ROUTE_PATHS.medMngSignup} className="text-primary hover:underline">
              Créer un compte
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
