import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface SecureCredentialsFormProps {
  onSubmit: (credentials: { username: string; password: string }) => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

/**
 * Composant sécurisé pour la saisie des credentials CAS
 * Remplace les credentials hardcodés par une saisie utilisateur sécurisée
 */
export function SecureCredentialsForm({ 
  onSubmit, 
  isLoading = false, 
  title = "Authentification CAS",
  description = "Saisissez vos identifiants CAS pour l'extraction sécurisée"
}: SecureCredentialsFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { logActivity } = useActivityTracking();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      alert('⚠️ Veuillez saisir vos identifiants CAS');
      return;
    }

    // Validation basique du format email
    if (!username.includes('@')) {
      alert('⚠️ L\'username doit être un email valide');
      return;
    }

    // Track auth attempt
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { type: 'cas_auth_attempt' }
    });

    onSubmit({ username: username.trim(), password });
  };

  // Credentials from env are not supported in Lovable - always require user input
  const hasEnvCredentials = false;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {!hasEnvCredentials && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Sécurité:</strong> Vos identifiants ne seront pas stockés et sont utilisés uniquement pour cette session.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Email CAS / Username</Label>
            <Input
              id="username"
              type="email"
              placeholder="votre.email@etud.institution.fr"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe CAS</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe CAS"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? "🙈" : "👁️"}
              </Button>
            </div>
          </div>

          {hasEnvCredentials && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Credentials chargés depuis les variables d'environnement de développement.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || (!username.trim() || !password.trim())}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Authentification...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Se connecter de manière sécurisée
              </div>
            )}
          </Button>
        </form>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>🔒 Connexion sécurisée via HTTPS</p>
          <p>🛡️ Aucune donnée stockée localement</p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Hook pour gérer les credentials sécurisés
 */
export function useSecureCredentials() {
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  // Credentials from env are not supported in Lovable - always require user input
  const hasEnvCredentials = false;
  
  const getCredentials = (): Promise<{ username: string; password: string }> => {
    return new Promise((resolve, reject) => {
      // Si déjà saisis dans cette session, les réutiliser
      if (credentials) {
        resolve(credentials);
        return;
      }

      // Afficher le formulaire de saisie
      setShowCredentialsForm(true);
      
      // Attendre la saisie utilisateur...
      const checkCredentials = setInterval(() => {
        if (credentials) {
          clearInterval(checkCredentials);
          setShowCredentialsForm(false);
          resolve(credentials);
        }
      }, 100);

      // Timeout après 5 minutes
      setTimeout(() => {
        clearInterval(checkCredentials);
        setShowCredentialsForm(false);
        reject(new Error('Timeout: Aucun credential saisi'));
      }, 300000);
    });
  };

  const handleCredentialsSubmit = (newCredentials: { username: string; password: string }) => {
    setCredentials(newCredentials);
    setShowCredentialsForm(false);
  };

  const clearCredentials = () => {
    setCredentials(null);
  };

  return {
    getCredentials,
    handleCredentialsSubmit,
    clearCredentials,
    showCredentialsForm,
    hasCredentials: !!credentials || hasEnvCredentials
  };
}