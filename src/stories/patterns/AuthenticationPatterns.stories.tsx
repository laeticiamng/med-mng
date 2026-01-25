import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

/**
 * # Authentication Patterns
 * 
 * Ensemble complet de patterns d'authentification avec validation, gestion d'erreurs et états de chargement :
 * - **Login** : Connexion avec email/mot de passe
 * - **Signup** : Inscription avec validation complète
 * - **Forgot Password** : Récupération de mot de passe
 * - **2FA** : Authentification à deux facteurs avec code OTP
 */

// Schémas de validation Zod
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Login Pattern
function LoginPattern() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    // Simuler un appel API
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue ${data.email}`,
      });
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Entrez vos identifiants pour accéder à votre compte
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" {...register('rememberMe')} />
                <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                  Se souvenir de moi
                </Label>
              </div>
              <Button variant="link" className="px-0 text-sm" type="button">
                Mot de passe oublié ?
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Pas encore de compte ?{' '}
              <Button variant="link" className="px-0" type="button">
                S'inscrire
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Signup Pattern
function SignupPattern() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Inscription réussie',
        description: `Bienvenue ${data.name} ! Un email de confirmation a été envoyé.`,
      });
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Inscription</CardTitle>
          <CardDescription>
            Créez votre compte pour commencer
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Jean Dupont"
                  className="pl-10"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              
              {/* Password strength indicator */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-success' : 'bg-muted'}`} />
                    <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(password) ? 'bg-success' : 'bg-muted'}`} />
                    <div className={`h-1 flex-1 rounded ${/[0-9]/.test(password) ? 'bg-success' : 'bg-muted'}`} />
                    <div className={`h-1 flex-1 rounded ${/[^A-Za-z0-9]/.test(password) ? 'bg-success' : 'bg-muted'}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Doit contenir 8+ caractères, majuscule, chiffre et caractère spécial
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox id="acceptTerms" {...register('acceptTerms')} className="mt-1" />
              <Label htmlFor="acceptTerms" className="text-sm cursor-pointer leading-relaxed">
                J'accepte les{' '}
                <Button variant="link" className="px-0 h-auto text-sm" type="button">
                  conditions d'utilisation
                </Button>{' '}
                et la{' '}
                <Button variant="link" className="px-0 h-auto text-sm" type="button">
                  politique de confidentialité
                </Button>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer mon compte
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Déjà un compte ?{' '}
              <Button variant="link" className="px-0" type="button">
                Se connecter
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Forgot Password Pattern
function ForgotPasswordPattern() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (_data: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast({
        title: 'Email envoyé',
        description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.',
      });
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-success/10 dark:bg-success/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-success" />
            </div>
            <CardTitle className="text-2xl font-bold">Email envoyé</CardTitle>
            <CardDescription>
              Un email de réinitialisation a été envoyé à votre adresse. Vérifiez votre boîte mail et suivez les instructions.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-4">
            <Button variant="outline" className="w-full" onClick={() => setIsSuccess(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer le lien
            </Button>
            <Button variant="link" type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// 2FA Pattern
function TwoFactorPattern() {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const { toast } = useToast();
  
  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      toast({
        title: 'Code invalide',
        description: 'Le code doit contenir 6 chiffres.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Authentification réussie',
        description: 'Code de vérification accepté.',
      });
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Authentification à deux facteurs</CardTitle>
          <CardDescription>
            Entrez le code de vérification à 6 chiffres envoyé sur votre téléphone
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold"
                />
              ))}
            </div>
            
            <div className="text-center">
              <Button variant="link" type="button" className="text-sm">
                Vous n'avez pas reçu le code ? Renvoyer
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || code.join('').length !== 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vérifier
            </Button>
            <Button variant="link" type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Utiliser une autre méthode
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

const meta: Meta = {
  title: 'Patterns/Authentication',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Authentication Patterns

Ensemble complet de patterns d'authentification prêts à l'emploi avec :

### Patterns inclus
- ✅ **Login** : Connexion avec validation email/mot de passe
- ✅ **Signup** : Inscription avec validation de mot de passe fort
- ✅ **Forgot Password** : Réinitialisation avec envoi d'email
- ✅ **2FA** : Authentification à deux facteurs avec code OTP

### Fonctionnalités
- Validation complète avec Zod
- Gestion d'erreurs en temps réel
- États de chargement avec spinners
- Toast notifications
- Password strength indicator
- Show/hide password toggle
- Remember me checkbox
- Auto-focus sur les champs
- Design responsive

### Technologies
- **React Hook Form** : Gestion des formulaires
- **Zod** : Validation de schémas
- **Shadcn UI** : Composants de base
- **Lucide Icons** : Icônes
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Login: Story = {
  render: () => <LoginPattern />,
  parameters: {
    docs: {
      description: {
        story: 'Pattern de connexion avec email/mot de passe, "remember me" et gestion d\'erreurs.',
      },
    },
  },
};

export const Signup: Story = {
  render: () => <SignupPattern />,
  parameters: {
    docs: {
      description: {
        story: 'Pattern d\'inscription avec validation de mot de passe fort et indicateur de force.',
      },
    },
  },
};

export const ForgotPassword: Story = {
  render: () => <ForgotPasswordPattern />,
  parameters: {
    docs: {
      description: {
        story: 'Pattern de récupération de mot de passe avec envoi d\'email de réinitialisation.',
      },
    },
  },
};

export const TwoFactor: Story = {
  render: () => <TwoFactorPattern />,
  parameters: {
    docs: {
      description: {
        story: 'Pattern d\'authentification à deux facteurs avec saisie de code à 6 chiffres.',
      },
    },
  },
};
