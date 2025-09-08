import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthProvider';
import { 
  Music, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Heart,
  Brain,
  Stethoscope
} from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
  name?: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
}

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    name: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  const { signIn, signUp, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
  const { toast } = useToast();

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email requis';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Format d\'email invalide';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Mot de passe requis';
    if (password.length < 6) return 'Au moins 6 caractères requis';
    if (!isLogin && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Au moins 1 majuscule, 1 minuscule et 1 chiffre';
    }
    return undefined;
  };

  const validateName = (name: string): string | undefined => {
    if (!isLogin && !name) return 'Nom requis';
    if (!isLogin && name.length < 2) return 'Au moins 2 caractères';
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      name: !isLogin ? validateName(formData.name || '') : undefined
    };

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.email, formData.password, formData.name || '');
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: isLogin ? "Connexion réussie !" : "Inscription réussie !",
        description: isLogin ? 
          "Bienvenue sur MED-MNG" : 
          "Consultez votre email pour confirmer votre compte",
      });

    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Erreur d'authentification",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setSocialLoading(provider);
    
    try {
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
        throw new Error(result.error.message);
      }

    } catch (error) {
      toast({
        title: "Erreur de connexion sociale",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const passwordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Très faible', color: 'text-red-500' },
      { score: 2, label: 'Faible', color: 'text-orange-500' },
      { score: 3, label: 'Moyen', color: 'text-yellow-500' },
      { score: 4, label: 'Bon', color: 'text-blue-500' },
      { score: 5, label: 'Fort', color: 'text-green-500' },
      { score: 6, label: 'Excellent', color: 'text-green-600' }
    ];

    return levels[Math.min(score, 6)];
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-pink-200/30 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <motion.div 
              className="flex items-center justify-center gap-2 mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <Music className="h-12 w-12 text-blue-600" />
                <Sparkles className="h-6 w-6 text-purple-500 absolute -top-1 -right-1" />
              </div>
            </motion.div>

            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MED-MNG
            </CardTitle>
            
            <CardDescription className="text-base">
              Apprentissage médical révolutionnaire par l'IA et la musique
            </CardDescription>

            {/* Feature highlights */}
            <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3 text-blue-500" />
                <span>IA Avancée</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-pink-500" />
                <span>Pédagogie</span>
              </div>
              <div className="flex items-center gap-1">
                <Stethoscope className="h-3 w-3 text-green-500" />
                <span>Médecine</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Auth Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  isLogin 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="Basculer vers la connexion"
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  !isLogin 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="Basculer vers l'inscription"
              >
                Inscription
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nom complet *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Votre nom complet"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={validationErrors.name ? 'border-red-500' : ''}
                        aria-describedby={validationErrors.name ? 'name-error' : undefined}
                        aria-invalid={!!validationErrors.name}
                      />
                      {validationErrors.name && (
                        <Alert variant="destructive" className="py-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription id="name-error" className="text-xs">
                            {validationErrors.name}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={validationErrors.email ? 'border-red-500' : ''}
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                  aria-invalid={!!validationErrors.email}
                />
                {validationErrors.email && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription id="email-error" className="text-xs">
                      {validationErrors.email}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Mot de passe *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                    aria-describedby={validationErrors.password ? 'password-error' : 'password-strength'}
                    aria-invalid={!!validationErrors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {!isLogin && formData.password && (
                  <div className="text-xs" id="password-strength">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-muted rounded overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            strength.score === 0 ? 'w-0' :
                            strength.score <= 2 ? 'w-1/3 bg-red-500' :
                            strength.score <= 4 ? 'w-2/3 bg-yellow-500' :
                            'w-full bg-green-500'
                          }`}
                        />
                      </div>
                      <span className={strength.color}>{strength.label}</span>
                    </div>
                  </div>
                )}

                {validationErrors.password && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription id="password-error" className="text-xs">
                      {validationErrors.password}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isLogin ? 'Connexion...' : 'Création du compte...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Se connecter' : 'Créer mon compte'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Social Login */}
            <div className="space-y-4">
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-muted-foreground">
                  Ou continuez avec
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                  disabled={socialLoading !== null}
                  className="relative"
                  aria-label="Continuer avec Google"
                >
                  {socialLoading === 'google' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={socialLoading !== null}
                  className="relative"
                  aria-label="Continuer avec Facebook"
                >
                  {socialLoading === 'facebook' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('apple')}
                  disabled={socialLoading !== null}
                  className="relative"
                  aria-label="Continuer avec Apple"
                >
                  {socialLoading === 'apple' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  )}
                </Button>
              </div>
            </div>

            {/* Footer info */}
            <div className="text-center text-xs text-muted-foreground space-y-2">
              <p>
                En continuant, vous acceptez nos{' '}
                <a href="#" className="text-primary hover:underline">Conditions d'utilisation</a>
                {' '}et notre{' '}
                <a href="#" className="text-primary hover:underline">Politique de confidentialité</a>
              </p>
              
              {!isLogin && (
                <div className="flex items-center justify-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Plateforme sécurisée et conforme RGPD</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};