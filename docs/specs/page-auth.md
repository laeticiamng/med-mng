# 🔐 PAGE AUTH - Spécifications techniques

## 1. But & User Stories

**En tant que visiteur non connecté, je peux :**
- Créer un nouveau compte avec email/mot de passe
- Me connecter avec mes identifiants existants
- Réinitialiser mon mot de passe oublié
- Voir les avantages de la plateforme avant inscription
- Me connecter via Google/Github (OAuth)

**En tant qu'utilisateur existant, je peux :**
- Me reconnecter automatiquement (session persistée)
- Me déconnecter de tous mes appareils
- Récupérer ma session après fermeture navigateur

**En tant qu'admin, je peux :**
- Voir les statistiques d'inscription
- Gérer les utilisateurs problématiques

## 2. Données & Accès

### Sources de données
```typescript
// Tables Supabase (auth schema - managed by Supabase)
- auth.users (id, email, email_confirmed_at, created_at, last_sign_in_at)
- auth.identities (user_id, provider, identity_data)
- auth.sessions (user_id, token, expires_at)

// Tables publiques
- profiles (id, display_name, avatar_url, onboarding_completed)
- user_subscriptions (user_id, plan_type, status)
- auth_events (user_id, event_type, ip_address, user_agent, created_at)

// Edge Functions
- send-welcome-email (trigger after signup)
- user-cleanup (anonymize deleted accounts)
```

### Routes et redirections
```typescript
// Routes auth
/auth → Page auth unifiée (sign in + sign up)
/auth/callback → OAuth callback handler
/auth/reset-password → Reset password form
/auth/verify-email → Email verification handler

// Redirections après auth
const redirectAfterAuth = (user: User) => {
  if (!user.profile?.onboarding_completed) {
    return '/onboarding'
  }
  
  // Redirect to intended page or dashboard
  const intended = localStorage.getItem('intendedRoute')
  return intended || '/dashboard'
}
```

### Session management
```typescript
// Session persistence via Supabase client (automatique)
const { data: { session } } = await supabase.auth.getSession()

// Auth state listener pour sync app state
supabase.auth.onAuthStateChange((event, session) => {
  setUser(session?.user ?? null)
  setSession(session)
  
  if (event === 'SIGNED_IN') {
    queryClient.invalidateQueries({ queryKey: ['user'] })
    navigate(redirectAfterAuth(session.user))
  }
  
  if (event === 'SIGNED_OUT') {
    queryClient.clear()
    navigate('/auth')
  }
})
```

## 3. États UI obligatoires

### Loading States
- Sign in : spinner sur bouton + disabled form
- Sign up : progress indicator pour étapes
- OAuth : "Connexion avec Google..." + spinner
- Password reset : confirmation pendant envoi email

### Success States
- Sign up : "Vérifiez votre email" + instructions
- Password reset sent : "Email envoyé" + retry option
- Email verified : "Email confirmé" + redirect
- Auth success : "Connexion réussie" + redirect

### Error States
- Invalid credentials : "Email ou mot de passe incorrect"
- Email already exists : "Compte existant" + link connexion
- Weak password : "Mot de passe trop faible" + requirements
- Rate limited : "Trop de tentatives" + timer
- Network error : "Problème de connexion" + retry

### Validation States
- **Email validation** : format, domaine, disponibilité
- **Password strength** : longueur, complexité, score visuel
- **Form validation** : temps réel + submit

## 4. Actions & Effets

### Actions d'authentification
```typescript
type AuthAction = 
  | { type: "sign_in", email: string, password: string }
  | { type: "sign_up", email: string, password: string, displayName: string }
  | { type: "sign_in_oauth", provider: 'google' | 'github' }
  | { type: "reset_password", email: string }
  | { type: "sign_out" }
  | { type: "sign_out_all_devices" }

// Sign up avec profile creation
const signUp = useMutation({
  mutationFn: async ({ email, password, displayName }) => {
    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { display_name: displayName }
      }
    })
    
    if (error) throw error
    
    // 2. Profile sera créé via trigger DB après confirmation email
    return data
  },
  onSuccess: (data) => {
    if (data.user && !data.session) {
      // Email confirmation required
      setAuthState('awaiting_verification')
      toast.success("Vérifiez votre email pour activer votre compte")
    }
    
    track('user_signup_completed', {
      user_id: data.user?.id,
      email_verified: !!data.session
    })
  },
  onError: (error) => {
    let message = "Erreur lors de l'inscription"
    
    if (error.message.includes('already registered')) {
      message = "Ce compte existe déjà. Connectez-vous plutôt."
    } else if (error.message.includes('invalid email')) {
      message = "Format d'email invalide"
    } else if (error.message.includes('weak password')) {
      message = "Mot de passe trop faible. Minimum 8 caractères."
    }
    
    toast.error(message)
  }
})
```

### OAuth integration sécurisée
```typescript
const signInWithOAuth = useMutation({
  mutationFn: async (provider: 'google' | 'github') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    
    if (error) throw error
    return data
  },
  onMutate: (provider) => {
    track('oauth_initiated', { provider })
  }
})
```

### Password reset flow
```typescript
const resetPassword = useMutation({
  mutationFn: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    if (error) throw error
    return true
  },
  onSuccess: () => {
    setAuthState('reset_email_sent')
    toast.success("Email de réinitialisation envoyé")
  }
})

// Handle reset password form (from email link)
const updatePassword = useMutation({
  mutationFn: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) throw error
    return true
  },
  onSuccess: () => {
    toast.success("Mot de passe mis à jour")
    navigate('/dashboard')
  }
})
```

### Security features
```typescript
// Rate limiting client-side
const useRateLimit = (action: string, limit: number, windowMs: number) => {
  const attempts = useRef<number[]>([])
  
  const canAttempt = () => {
    const now = Date.now()
    attempts.current = attempts.current.filter(time => now - time < windowMs)
    return attempts.current.length < limit
  }
  
  const recordAttempt = () => {
    attempts.current.push(Date.now())
  }
  
  return { canAttempt, recordAttempt }
}

// Password strength indicator
const usePasswordStrength = (password: string) => {
  const strength = useMemo(() => {
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    
    return {
      score,
      level: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
      feedback: getPasswordFeedback(password, score)
    }
  }, [password])
  
  return strength
}
```

## 5. Observabilité

### Analytics events
```typescript
// Auth lifecycle events
track('auth_page_viewed', {
  page_type: 'signin' | 'signup' | 'reset',
  referrer: document.referrer,
  utm_params: getUtmParams()
})

track('auth_attempt', {
  auth_type: 'email' | 'oauth',
  provider?: 'google' | 'github',
  success: boolean,
  error_type?: 'invalid_credentials' | 'rate_limited' | 'network_error'
})

track('user_signup_started', {
  signup_method: 'email' | 'oauth',
  funnel_step: 'form_filled'
})

track('user_signup_completed', {
  user_id: userId,
  signup_method: 'email' | 'oauth',
  email_verified: boolean,
  time_to_signup_seconds: signupTime
})

track('password_reset_requested', {
  email_hash: hashEmail(email), // anonymized
  success: boolean
})

// Security events
track('suspicious_auth_activity', {
  event_type: 'multiple_failed_attempts' | 'unusual_location',
  ip_address: getHashedIP(),
  user_agent: navigator.userAgent,
  attempts_count?: number
})

track('session_established', {
  user_id: userId,
  device_type: getDeviceType(),
  session_duration_expected: sessionExpiryTime
})
```

### Error tracking (Sentry)
```typescript
// Enhanced error context for auth errors
const trackAuthError = (error: Error, context: AuthContext) => {
  Sentry.withScope(scope => {
    scope.setTag('auth_flow', context.flow)
    scope.setContext('auth_attempt', {
      method: context.method,
      step: context.step,
      rateLimited: context.rateLimited
    })
    scope.captureException(error)
  })
}
```

## 6. Tests

### Tests unitaires
```typescript
describe('AuthForm', () => {
  it('validates email format correctly')
  it('shows password strength indicator')
  it('handles rate limiting appropriately')
  it('displays appropriate error messages')
})

describe('useAuth hook', () => {
  it('manages auth state correctly')
  it('handles session restoration')
  it('redirects after successful auth')
})

describe('Password Reset', () => {
  it('sends reset email successfully')
  it('validates new password requirements')
  it('updates password securely')
})
```

### Tests d'intégration
```typescript
describe('Auth Flow Integration', () => {
  it('completes signup to dashboard workflow', async () => {
    // Sign up → Email verification → Profile creation → Dashboard
  })
  
  it('handles OAuth flow correctly')
  it('persists session across browser reload')
  it('manages multiple auth providers')
})
```

### Tests E2E
```typescript
test('user can sign up and access platform', async ({ page }) => {
  await page.goto('/auth')
  
  // Switch to signup
  await page.click('[data-testid="signup-tab"]')
  
  // Fill signup form
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  await page.fill('[data-testid="password-input"]', 'SecurePassword123!')
  await page.fill('[data-testid="name-input"]', 'Test User')
  
  // Submit signup
  await page.click('[data-testid="signup-submit"]')
  
  // Should show email verification message
  await expect(page.locator('[data-testid="verify-email-message"]')).toBeVisible()
  
  // Simulate email verification (test environment)
  await page.goto('/auth/callback?token=test-verification-token')
  
  // Should redirect to onboarding or dashboard
  await expect(page.url()).toMatch(/(onboarding|dashboard)/)
})

test('user can sign in with existing account', async ({ page }) => {
  await page.goto('/auth')
  
  await page.fill('[data-testid="email-input"]', 'existing@example.com')
  await page.fill('[data-testid="password-input"]', 'password123')
  await page.click('[data-testid="signin-submit"]')
  
  // Should redirect to dashboard
  await expect(page.url()).toContain('/dashboard')
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
})

test('user can reset forgotten password', async ({ page }) => {
  await page.goto('/auth')
  
  await page.click('[data-testid="forgot-password-link"]')
  await page.fill('[data-testid="reset-email-input"]', 'user@example.com')
  await page.click('[data-testid="send-reset-email"]')
  
  await expect(page.locator('[data-testid="reset-email-sent"]')).toBeVisible()
})
```

## 7. Contrats API & Database

### Database Triggers
```sql
-- Create profile after user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  
  -- Create default subscription
  insert into public.user_subscriptions (user_id, plan_type, status)
  values (new.id, 'freemium', 'active');
  
  -- Log signup event
  insert into public.auth_events (user_id, event_type, metadata)
  values (new.id, 'user_created', jsonb_build_object('signup_method', 'email'));
  
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger to auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Edge Function: Welcome Email
```typescript
// supabase/functions/send-welcome-email/index.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { user_id, email, display_name } = await req.json()
    
    // Send welcome email via your email service
    const emailSent = await sendWelcomeEmail({
      to: email,
      name: display_name,
      template: 'welcome-med-mng'
    })
    
    if (emailSent) {
      // Log successful email
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )
      
      await supabase
        .from('auth_events')
        .insert({
          user_id,
          event_type: 'welcome_email_sent',
          metadata: { email_provider: 'sendgrid' }
        })
    }
    
    return new Response(JSON.stringify({ success: true }))
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    })
  }
})
```

### RLS Policies pour auth_events
```sql
-- Auth events table
create table public.auth_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  ip_address inet,
  user_agent text,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- RLS Policies
alter table public.auth_events enable row level security;

create policy "Users can view own auth events"
  on public.auth_events for select
  using (auth.uid() = user_id);

create policy "Service role can manage auth events"
  on public.auth_events for all
  using (auth.jwt() ->> 'role' = 'service_role');
```

## 8. Composants clés

### AuthForm unifiée
```typescript
interface AuthFormProps {
  mode: 'signin' | 'signup'
  onToggleMode: () => void
  redirectTo?: string
}

export const AuthForm = ({ mode, onToggleMode, redirectTo }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  
  const signIn = useSignIn()
  const signUp = useSignUp()
  const { canAttempt, recordAttempt } = useRateLimit('auth', 5, 15 * 60 * 1000)
  const passwordStrength = usePasswordStrength(password)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canAttempt()) {
      toast.error("Trop de tentatives. Réessayez dans 15 minutes.")
      return
    }
    
    recordAttempt()
    
    try {
      if (mode === 'signin') {
        await signIn.mutateAsync({ email, password })
      } else {
        await signUp.mutateAsync({ email, password, displayName })
      }
    } catch (error) {
      // Error handling in mutation onError
    }
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'signin' ? 'Connexion' : 'Créer un compte'}
        </CardTitle>
        <CardDescription>
          {mode === 'signin' 
            ? 'Accédez à votre espace d\'apprentissage'
            : 'Rejoignez la communauté MED-MNG'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <FormField
              label="Nom d'affichage"
              value={displayName}
              onChange={setDisplayName}
              required
              placeholder="Comment vous appeler ?"
            />
          )}
          
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
            placeholder="votre@email.com"
          />
          
          <div className="space-y-2">
            <FormField
              label="Mot de passe"
              type="password"
              value={password}
              onChange={setPassword}
              required
              placeholder={mode === 'signin' ? 'Votre mot de passe' : 'Minimum 8 caractères'}
            />
            
            {mode === 'signup' && password && (
              <PasswordStrengthIndicator strength={passwordStrength} />
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={signIn.isPending || signUp.isPending || !canAttempt()}
          >
            {signIn.isPending || signUp.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {mode === 'signin' ? 'Se connecter' : 'Créer le compte'}
          </Button>
        </form>
        
        <div className="mt-4 space-y-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continuer avec
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => signInWithOAuth.mutate('google')}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                {/* Google icon */}
              </svg>
              Google
            </Button>
            
            <Button variant="outline" onClick={() => signInWithOAuth.mutate('github')}>
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        {mode === 'signin' && (
          <Button variant="link" onClick={() => navigate('/auth/reset-password')}>
            Mot de passe oublié ?
          </Button>
        )}
        
        <p className="text-sm text-muted-foreground text-center">
          {mode === 'signin' ? "Pas encore de compte ?" : "Déjà un compte ?"}
          <Button variant="link" onClick={onToggleMode} className="p-0 ml-1">
            {mode === 'signin' ? 'S\'inscrire' : 'Se connecter'}
          </Button>
        </p>
      </CardFooter>
    </Card>
  )
}
```

### PasswordStrengthIndicator
```typescript
interface PasswordStrengthProps {
  strength: {
    score: number
    level: 'weak' | 'medium' | 'strong'
    feedback: string[]
  }
}

export const PasswordStrengthIndicator = ({ strength }) => {
  const getColor = () => {
    switch (strength.level) {
      case 'weak': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }
  
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              level <= strength.score ? getColor() : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p className="font-medium">
          Sécurité : {strength.level === 'weak' ? 'Faible' : strength.level === 'medium' ? 'Moyenne' : 'Forte'}
        </p>
        {strength.feedback.length > 0 && (
          <ul className="mt-1 space-y-1">
            {strength.feedback.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
```

## 9. Définition de Fini

✅ **Auth page est "Done" quand :**
- [ ] Sign up/Sign in unifiés avec validation temps réel
- [ ] OAuth Google/GitHub fonctionnel avec redirections correctes
- [ ] Reset password complet (email → form → update)
- [ ] Email verification avec resend option
- [ ] Rate limiting côté client (15min après 5 échecs)
- [ ] Password strength indicator interactif
- [ ] Session persistence cross-tabs/reload
- [ ] Profile creation automatique après signup
- [ ] Welcome email trigger fonctionnel
- [ ] Redirections intelligentes (intended route)
- [ ] États loading/success/error pour tous les flows
- [ ] Tests E2E : signup → verification → signin → dashboard
- [ ] Performance : auth actions < 2s, page load < 1s
- [ ] Accessibilité : forms navigables clavier, screen reader
- [ ] Analytics : tracking complet funnel auth
- [ ] Sécurité : HTTPS only, secure cookies, rate limiting
- [ ] RLS : auth events et profiles sécurisés