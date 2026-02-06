import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConsentCheckboxes } from '@/components/med-mng/ConsentCheckboxes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { ROUTE_PATHS } from '@/config/routes';
import { supabase } from '@/integrations/supabase/client';
import { trackConversionEvent } from '@/lib/conversionTracking';
import { toast } from 'sonner';

export const MedMngSignup = () => {
  const { user, signUp, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
  const { logActivity } = useActivityTracking();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Consentements RGPD
  const [cguAccepted, setCguAccepted] = useState(false);
  const [healthDataAccepted, setHealthDataAccepted] = useState(false);
  const [internationalTransferAccepted, setInternationalTransferAccepted] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [showConsentErrors, setShowConsentErrors] = useState(false);

  if (user) {
    return <Navigate to={ROUTE_PATHS.medMngMusicLibrary} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowConsentErrors(false);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    // Vérification des consentements obligatoires
    if (!cguAccepted || !healthDataAccepted || !internationalTransferAccepted || !ageVerified) {
      setError('Veuillez accepter tous les consentements obligatoires');
      setShowConsentErrors(true);
      setLoading(false);
      setTimeout(() => {
        document.getElementById('consent-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    const { error } = await signUp(email, password, name);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      logActivity({ activity_type: 'study', metadata: { action: 'signup_success' } });
      trackConversionEvent('signup', { method: 'email' });
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
    }
  };

  const handleResendEmail = async () => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Email renvoyé !', { description: 'Vérifiez votre boîte de réception.' });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-success">Compte créé !</CardTitle>
            <CardDescription>
              Vérifiez votre email pour confirmer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={ROUTE_PATHS.medMngLogin}>
              <Button className="w-full">Retour à la connexion</Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={handleResendEmail}>
              Renvoyer l'email de vérification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">MED-MNG</CardTitle>
          <CardDescription>Créez votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            
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
                autoComplete="new-password"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {/* Consentements RGPD obligatoires */}
            <div id="consent-section">
            <ConsentCheckboxes
              cguAccepted={cguAccepted}
              onCguChange={setCguAccepted}
              healthDataAccepted={healthDataAccepted}
              onHealthDataChange={setHealthDataAccepted}
              internationalTransferAccepted={internationalTransferAccepted}
              onInternationalTransferChange={setInternationalTransferAccepted}
              ageVerified={ageVerified}
              onAgeChange={setAgeVerified}
              showErrors={showConsentErrors}
            />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Création...' : 'Créer le compte'}
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
            Déjà un compte ?{' '}
            <Link to={ROUTE_PATHS.medMngLogin} className="text-primary hover:underline">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
