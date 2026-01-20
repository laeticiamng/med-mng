import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Music, AlertTriangle, Clock } from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useRateLimiting, RateLimitPresets } from '@/hooks/useRateLimiting';

export const MedMngLogin = () => {
  const { user, signIn, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [blockTimeDisplay, setBlockTimeDisplay] = useState('');
  const { logActivity } = useActivityTracking();

  // Rate limiting pour les tentatives de connexion
  const {
    isBlocked,
    recordAttempt,
    recordSuccess,
    formatBlockTime,
    state: rateLimitState
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
    return <Navigate to={ROUTE_PATHS.medMngLibrary} replace />;
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
          
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              className="w-full"
            >
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('facebook')}
              className="w-full"
            >
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('apple')}
              className="w-full"
            >
              Apple
            </Button>
          </div>
          
          <div className="text-center text-sm">
            Pas encore de compte ?{' '}
            <Link to={ROUTE_PATHS.medMngSignup} className="text-primary hover:underline">
              Créer un compte
            </Link>
          </div>
          
          <div className="text-center text-sm">
            <Link to={ROUTE_PATHS.medMngPricing} className="text-primary hover:underline">
              Voir les offres d'abonnement
            </Link>
          </div>

          <div className="text-center text-sm">
            <Link to={ROUTE_PATHS.medMngLibrary} className="text-primary hover:underline">
              Accéder à l'application
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
