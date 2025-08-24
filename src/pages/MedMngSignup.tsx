import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';

export const MedMngSignup = () => {
  const { user, signUp, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (user) {
    return <Navigate to="/med-mng/library" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
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
      <ConsistentBackground variant="light">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md relative z-20 bg-white/95 backdrop-blur-sm shadow-2xl border border-white/50">
            <CardHeader className="text-center">
              <h1 className="text-2xl font-bold text-green-600">Compte créé !</h1>
              <CardDescription>
                Vérifiez votre email pour confirmer votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/med-mng/login" aria-label="Retourner à la page de connexion">
                <Button className="w-full">Retour à la connexion</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ConsistentBackground>
    );
  }

  return (
    <ConsistentBackground variant="light">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md relative z-20 bg-white/95 backdrop-blur-sm shadow-2xl border border-white/50">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">MED-MNG - Création de compte</h1>
            <CardDescription>Créez votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" role="alert" aria-live="assertive">
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
                  aria-describedby="name-help"
                  aria-invalid={error ? 'true' : 'false'}
                />
                <div id="name-help" className="sr-only">
                  Entrez votre nom complet pour créer votre compte
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-describedby="email-help"
                  aria-invalid={error ? 'true' : 'false'}
                />
                <div id="email-help" className="sr-only">
                  Entrez une adresse email valide pour votre compte
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-describedby="password-help"
                  aria-invalid={error ? 'true' : 'false'}
                />
                <div id="password-help" className="text-xs text-muted-foreground">
                  Choisissez un mot de passe sécurisé pour protéger votre compte
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  aria-describedby="confirm-password-help"
                  aria-invalid={password !== confirmPassword && confirmPassword.length > 0 ? 'true' : 'false'}
                />
                <div id="confirm-password-help" className="text-xs text-muted-foreground">
                  Répétez votre mot de passe pour le confirmer
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading} aria-describedby="signup-submit-help">
                {loading ? 'Création...' : 'Créer le compte'}
              </Button>
              <div id="signup-submit-help" className="sr-only">
                Cliquez pour créer votre nouveau compte MED-MNG
              </div>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Ou continuez avec</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="signup-oauth-label">
              <div id="signup-oauth-label" className="sr-only">Options d'inscription avec réseaux sociaux</div>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                className="w-full"
                aria-label="S'inscrire avec Google"
              >
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('facebook')}
                className="w-full"
                aria-label="S'inscrire avec Facebook"
              >
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('apple')}
                className="w-full"
                aria-label="S'inscrire avec Apple"
              >
                Apple
              </Button>
            </div>
            
            <div className="text-center text-sm">
              Déjà un compte ?{' '}
              <Link 
                to="/med-mng/login" 
                className="text-blue-600 hover:underline"
                aria-label="Se connecter à un compte MED-MNG existant"
              >
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ConsistentBackground>
  );
};