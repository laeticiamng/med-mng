
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">MED-MNG</CardTitle>
          <CardDescription>Connectez-vous à votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
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
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
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
            Pas encore de compte ?{' '}
            <Link to="/med-mng/signup" className="text-blue-600 hover:underline">
              Créer un compte
            </Link>
          </div>
          
          <div className="text-center text-sm">
            <Link to="/med-mng/pricing" className="text-blue-600 hover:underline">
              Voir les offres d'abonnement
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
