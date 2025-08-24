import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Music } from 'lucide-react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';

export const MedMngLogin = () => {
  const { user, signIn, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/med-mng/library" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
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

  return (
    <ConsistentBackground variant="light">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md relative z-20 bg-white/95 backdrop-blur-sm shadow-2xl border border-white/50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Music className="h-8 w-8 text-blue-600" aria-hidden="true" />
              <span className="text-2xl font-bold text-gray-900">MED-MNG</span>
            </div>
            <h1 className="sr-only">MED-MNG - Connexion à votre compte</h1>
            <CardDescription>Connectez-vous à votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" role="alert" aria-live="assertive">
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
                  aria-describedby="email-help"
                  aria-invalid={error ? 'true' : 'false'}
                />
                <div id="email-help" className="sr-only">
                  Entrez votre adresse email pour vous connecter
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
                <div id="password-help" className="sr-only">
                  Entrez votre mot de passe pour accéder à votre compte
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading} aria-describedby="submit-help">
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
              <div id="submit-help" className="sr-only">
                Cliquez pour vous connecter à votre compte MED-MNG
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
            
            <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="oauth-label">
              <div id="oauth-label" className="sr-only">Options de connexion avec réseaux sociaux</div>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                className="w-full"
                aria-label="Se connecter avec Google"
              >
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('facebook')}
                className="w-full"
                aria-label="Se connecter avec Facebook"
              >
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('apple')}
                className="w-full"
                aria-label="Se connecter avec Apple"
              >
                Apple
              </Button>
            </div>
            
            <div className="text-center text-sm">
              Pas encore de compte ?{' '}
              <Link 
                to="/med-mng/signup" 
                className="text-blue-600 hover:underline"
                aria-label="Créer un nouveau compte MED-MNG"
              >
                Créer un compte
              </Link>
            </div>
            
            <div className="text-center text-sm">
              <Link 
                to="/med-mng/pricing" 
                className="text-blue-600 hover:underline"
                aria-label="Découvrir les offres d'abonnement MED-MNG"
              >
                Voir les offres d'abonnement
              </Link>
            </div>

            <div className="text-center text-sm">
              <Link 
                to="/med-mng/library" 
                className="text-blue-600 hover:underline"
                aria-label="Accéder directement à l'application MED-MNG"
              >
                Accéder à l'application
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ConsistentBackground>
  );
};