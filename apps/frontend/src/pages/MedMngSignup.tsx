
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConsentCheckboxes } from '@/components/med-mng/ConsentCheckboxes';

// Password validation function
const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Au moins une minuscule');
  }
  if (!/\d/.test(password)) {
    errors.push('Au moins un chiffre');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Au moins un caractère spécial (!@#$%^&*...)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const MedMngSignup = () => {
  const { user, signUp, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Consentements RGPD
  const [cguAccepted, setCguAccepted] = useState(false);
  const [healthDataAccepted, setHealthDataAccepted] = useState(false);
  const [internationalTransferAccepted, setInternationalTransferAccepted] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [showConsentErrors, setShowConsentErrors] = useState(false);

  if (user) {
    return <Navigate to="/med-mng/library" replace />;
  }

  // Validate password in real-time
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowConsentErrors(false);

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(`Mot de passe trop faible: ${passwordValidation.errors.join(', ')}`);
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
      return;
    }

    const { error } = await signUp(email, password, name);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">Compte créé !</CardTitle>
            <CardDescription>
              Vérifiez votre email pour confirmer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/med-mng/login">
              <Button className="w-full">Retour à la connexion</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">MED-MNG</CardTitle>
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
              {password && passwordErrors.length > 0 && (
                <div className="text-xs text-amber-600 space-y-1 mt-2">
                  <p className="font-medium">Requis pour un mot de passe fort :</p>
                  <ul className="list-disc list-inside pl-2">
                    {passwordErrors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {password && passwordErrors.length === 0 && (
                <p className="text-xs text-green-600 mt-2">✓ Mot de passe fort</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Consentements RGPD obligatoires */}
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
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Création...' : 'Créer le compte'}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Ou continuez avec</span>
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
            <Link to="/med-mng/login" className="text-blue-600 hover:underline">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
