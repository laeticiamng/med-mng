import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConsentCheckboxes } from '@/components/med-mng/ConsentCheckboxes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { ROUTE_PATHS } from '@/config/routes';
import { trackConversionEvent } from '@/lib/conversionTracking';
import { toast } from 'sonner';

const MIN_PASSWORD_LENGTH = 6;

export const MedMngSignup = () => {
  const { user, signUp, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { logActivity } = useActivityTracking();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
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

    // Validation mot de passe
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`);
      setLoading(false);
      return;
    }

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

    const { error: signUpError } = await signUp(email, password, name);
    
    if (signUpError) {
      if (signUpError.message?.includes('already') || signUpError.status === 422) {
        setError('already_registered');
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    // Auto-confirm est actif : on connecte directement l'utilisateur
    logActivity({ activity_type: 'study', metadata: { action: 'signup_success' } });
    trackConversionEvent('signup', { method: 'email' });

    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      // Cas rare : le signup a réussi mais le signIn échoue
      toast.success('Compte créé avec succès !', { description: 'Connectez-vous avec vos identifiants.' });
      navigate(ROUTE_PATHS.medMngLogin);
    } else {
      toast.success('Bienvenue sur MED-MNG ! 🎵');
      // La redirection se fait automatiquement via le `if (user) return Navigate`
    }
    
    setLoading(false);
  };

  const handleOAuthSignIn = async (provider: 'google') => {
    setError('');
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error.message);
    }
  };

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
              <AlertDescription>
                {error === 'already_registered' ? (
                  <div className="space-y-2">
                    <p>Un compte existe déjà avec cet email.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(ROUTE_PATHS.medMngLogin)}
                    >
                      Se connecter
                    </Button>
                  </div>
                ) : error}
              </AlertDescription>
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
                minLength={MIN_PASSWORD_LENGTH}
              />
              <p className="text-xs text-muted-foreground">
                Minimum {MIN_PASSWORD_LENGTH} caractères
              </p>
              {password.length > 0 && password.length < MIN_PASSWORD_LENGTH && (
                <p className="text-xs text-destructive">
                  {MIN_PASSWORD_LENGTH - password.length} caractère(s) restant(s)
                </p>
              )}
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
          
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
            className="w-full"
          >
            Google
          </Button>
          
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
