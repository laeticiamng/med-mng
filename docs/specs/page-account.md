# 👤 PAGE COMPTE - Spécifications techniques

## 1. But & User Stories

**En tant qu'utilisateur connecté, je peux :**
- Consulter et modifier mes informations personnelles (nom, email, avatar)
- Gérer mon abonnement (plan actuel, historique factures, changement plan)
- Voir mes statistiques globales (progression, temps passé, scores)
- Configurer mes préférences (notifications, thème, langue)
- Consulter mon historique d'activité (ECOS/EDN complétés)
- Télécharger mes données personnelles (RGPD)
- Supprimer définitivement mon compte

**En tant qu'utilisateur freemium, je peux :**
- Voir mes limites d'usage actuelles
- Découvrir les avantages des plans premium
- Upgrader mon compte facilement

## 2. Données & Accès

### Sources de données
```typescript
// Tables Supabase
- profiles (id, display_name, avatar_url, email, created_at, subscription_type)
- user_subscriptions (user_id, plan_type, status, expires_at, stripe_subscription_id)
- user_statistics (user_id, total_ecos, total_edn, total_study_hours, avg_score)
- user_preferences (user_id, theme, language, notifications, privacy_settings)
- user_activity_log (user_id, activity_type, item_id, completed_at, score)
- user_sessions (user_id, device_info, last_active, ip_address)

// RPC Functions
- get_user_profile() → profile + subscription + stats
- update_user_profile(profile_data)
- get_user_activity_history(limit?, offset?) → paginated activities
- export_user_data() → GDPR export
- delete_user_account() → anonymization process
```

### Sections de la page
```typescript
// Routes/tabs account
/account → Profil général + stats
/account/subscription → Gestion abonnement
/account/preferences → Paramètres
/account/activity → Historique activité
/account/privacy → Données personnelles + RGPD
/account/sessions → Sessions actives + sécurité
```

### Cache Strategy
```typescript
// Profile data : cache moyen, update après modification
staleTime: 10 * 60 * 1000 // 10 min
// Statistics : cache court, update après activité
staleTime: 5 * 60 * 1000 // 5 min
// Activity history : cache court, pagination
staleTime: 2 * 60 * 1000 // 2 min
// Subscription : cache moyen, update après billing events
staleTime: 15 * 60 * 1000 // 15 min
```

## 3. États UI obligatoires

### Loading States
- Profile form : skeleton avec champs
- Statistics : skeleton cards avec placeholders
- Activity history : skeleton list items
- Avatar upload : progress bar + preview

### Empty States
- Nouvelle inscription : "Complétez votre profil pour commencer"
- Aucune activité : "Commencez votre premier ECOS/EDN"
- Pas d'abonnement : CTA upgrade avec benefits

### Error States
- Erreur de sauvegarde profil : retry + rollback local
- Upload avatar failed : message + retry
- Subscription error : contact support
- Export données failed : retry + email fallback

### États spécifiques
- **Subscription states** : active, past_due, canceled, trial
- **Email verification** : verified, pending, failed
- **Avatar states** : uploading, processing, ready, error

## 4. Actions & Effets

### Actions primaires
```typescript
type AccountAction = 
  | { type: "update_profile", data: ProfileData }
  | { type: "upload_avatar", file: File }
  | { type: "change_password", currentPassword: string, newPassword: string }
  | { type: "update_preferences", preferences: UserPreferences }
  | { type: "cancel_subscription" }
  | { type: "upgrade_subscription", planType: string }
  | { type: "export_data" }
  | { type: "delete_account", confirmation: string }

// Profile update avec optimistic
const updateProfile = useMutation({
  mutationFn: (profileData: ProfileData) =>
    supabase.rpc('update_user_profile', { p_profile_data: profileData }),
  onMutate: async (newProfile) => {
    // Optimistic update
    const previousProfile = queryClient.getQueryData(['user_profile', userId])
    queryClient.setQueryData(['user_profile', userId], {
      ...previousProfile,
      ...newProfile
    })
    return { previousProfile }
  },
  onError: (err, newProfile, context) => {
    // Rollback on error
    queryClient.setQueryData(['user_profile', userId], context.previousProfile)
    toast.error("Erreur lors de la sauvegarde")
  },
  onSuccess: () => {
    toast.success("Profil mis à jour")
  }
})
```

### Avatar upload avec optimisation
```typescript
const useAvatarUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  
  const uploadAvatar = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      throw new Error("Fichier trop volumineux (max 5MB)")
    }
    
    // Optimize image avant upload
    const optimizedFile = await optimizeImage(file, {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.8
    })
    
    setUploading(true)
    setPreview(URL.createObjectURL(optimizedFile))
    
    try {
      const fileName = `avatar-${userId}-${Date.now()}.webp`
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, optimizedFile)
      
      if (error) throw error
      
      // Update profile avec nouveau avatar URL
      const avatarUrl = supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl
      await updateProfile.mutateAsync({ avatar_url: avatarUrl })
      
      track('avatar_uploaded', { file_size: optimizedFile.size })
      
    } catch (error) {
      setPreview(null)
      throw error
    } finally {
      setUploading(false)
    }
  }
  
  return { uploadAvatar, uploading, preview }
}
```

### Password change sécurisé
```typescript
const changePassword = useMutation({
  mutationFn: async ({ currentPassword, newPassword }) => {
    // Vérifier password actuel d'abord
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })
    
    if (signInError) {
      throw new Error("Mot de passe actuel incorrect")
    }
    
    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) throw error
    
    return true
  },
  onSuccess: () => {
    toast.success("Mot de passe modifié avec succès")
    // Log out all other sessions for security
    supabase.auth.signOut({ scope: 'others' })
  }
})
```

### Export données RGPD
```typescript
const exportUserData = useMutation({
  mutationFn: async () => {
    const { data, error } = await supabase.rpc('export_user_data')
    if (error) throw error
    
    // Create downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `med-mng-data-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    return data
  },
  onSuccess: () => {
    toast.success("Export téléchargé avec succès")
    track('data_exported', { export_date: new Date().toISOString() })
  }
})
```

## 5. Observabilité

### Analytics events
```typescript
// Profile events
track('profile_updated', {
  fields_changed: changedFields,
  user_id: user.id,
  subscription_type: user.subscription_type
})

track('avatar_changed', {
  file_size_kb: fileSizeKB,
  upload_time_ms: uploadTime,
  optimization_applied: boolean
})

track('password_changed', {
  user_id: user.id, // anonymized
  security_level: passwordStrength
})

// Subscription events
track('subscription_viewed', {
  current_plan: currentPlan,
  expires_at: subscription.expires_at
})

track('upgrade_initiated', {
  from_plan: currentPlan,
  to_plan: targetPlan,
  trigger: 'account_page' | 'billing_reminder'
})

// Privacy events
track('data_export_requested', {
  export_type: 'full' | 'partial',
  data_size_mb: exportSizeMB
})

track('account_deletion_requested', {
  user_tenure_days: tenureDays,
  total_activities: totalActivities,
  reason?: deletionReason
})

// Security events
track('active_sessions_viewed', {
  total_sessions: sessionCount,
  suspicious_sessions: suspiciousCount
})

track('session_terminated', {
  session_id: sessionId,
  device_type: deviceType,
  termination_reason: 'user_action' | 'security'
})
```

## 6. Tests

### Tests unitaires
```typescript
describe('ProfileForm', () => {
  it('validates email format correctly')
  it('shows validation errors appropriately')
  it('handles optimistic updates')
  it('rolls back on save error')
})

describe('AvatarUpload', () => {
  it('optimizes large images before upload')
  it('shows upload progress')
  it('handles upload failures gracefully')
  it('validates file types and sizes')
})

describe('SubscriptionSection', () => {
  it('displays current plan correctly')
  it('shows usage limits for freemium users')
  it('handles plan upgrade flow')
})
```

### Tests d'intégration
```typescript
describe('Account Management', () => {
  it('updates profile end-to-end', async () => {
    // Update name → Save → Verify in database
  })
  
  it('handles subscription changes correctly')
  it('exports user data completely')
  it('deletes account with proper anonymization')
})
```

### Tests E2E
```typescript
test('user manages their account completely', async ({ page }) => {
  await page.goto('/account')
  
  // Update profile
  await page.fill('[data-testid="display-name"]', 'Nouveau Nom')
  await page.click('[data-testid="save-profile"]')
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
  
  // Upload avatar
  await page.setInputFiles('[data-testid="avatar-upload"]', 'test-avatar.jpg')
  await expect(page.locator('[data-testid="avatar-preview"]')).toBeVisible()
  
  // Check subscription
  await page.click('[data-testid="subscription-tab"]')
  await expect(page.locator('[data-testid="current-plan"]')).toContainText(/freemium|premium/)
  
  // View activity history
  await page.click('[data-testid="activity-tab"]')
  await expect(page.locator('[data-testid="activity-list"]')).toBeVisible()
  
  // Export data
  await page.click('[data-testid="privacy-tab"]')
  const downloadPromise = page.waitForEvent('download')
  await page.click('[data-testid="export-data"]')
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/med-mng-data-export-.*\.json/)
})
```

## 7. Contrats API

### RPC get_user_profile
```sql
create or replace function get_user_profile()
returns jsonb as $$
declare
  profile_data jsonb;
begin
  select jsonb_build_object(
    'profile', jsonb_build_object(
      'id', p.id,
      'display_name', p.display_name,
      'email', au.email,
      'avatar_url', p.avatar_url,
      'created_at', p.created_at,
      'email_verified', au.email_confirmed_at is not null
    ),
    'subscription', coalesce(
      jsonb_build_object(
        'plan_type', us.plan_type,
        'status', us.status,
        'expires_at', us.expires_at,
        'auto_renew', us.auto_renew
      ),
      '{"plan_type": "freemium", "status": "active"}'::jsonb
    ),
    'statistics', coalesce(
      jsonb_build_object(
        'total_ecos', ust.total_ecos,
        'total_edn', ust.total_edn,
        'total_study_hours', ust.total_study_hours,
        'avg_score', ust.avg_score,
        'streak_days', ust.current_streak_days,
        'joined_days_ago', extract(days from now() - p.created_at)
      ),
      '{"total_ecos": 0, "total_edn": 0, "total_study_hours": 0, "avg_score": 0}'::jsonb
    ),
    'preferences', coalesce(
      jsonb_build_object(
        'theme', up.theme,
        'language', up.language,
        'email_notifications', up.email_notifications,
        'push_notifications', up.push_notifications,
        'privacy_level', up.privacy_level
      ),
      '{"theme": "system", "language": "fr", "email_notifications": true}'::jsonb
    )
  ) into profile_data
  from auth.users au
  join public.profiles p on p.id = au.id
  left join user_subscriptions us on us.user_id = au.id and us.status = 'active'
  left join user_statistics ust on ust.user_id = au.id
  left join user_preferences up on up.user_id = au.id
  where au.id = auth.uid();
  
  if profile_data is null then
    raise exception 'PROFILE_NOT_FOUND';
  end if;
  
  return profile_data;
end;
$$ language plpgsql security definer;
```

### RPC update_user_profile
```sql
create or replace function update_user_profile(p_profile_data jsonb)
returns jsonb as $$
declare
  updated_profile jsonb;
begin
  -- Update profiles table
  update public.profiles
  set 
    display_name = coalesce(p_profile_data->>'display_name', display_name),
    avatar_url = coalesce(p_profile_data->>'avatar_url', avatar_url),
    updated_at = now()
  where id = auth.uid()
  returning jsonb_build_object(
    'id', id,
    'display_name', display_name,
    'avatar_url', avatar_url,
    'updated_at', updated_at
  ) into updated_profile;
  
  -- Update preferences if provided
  if p_profile_data ? 'preferences' then
    insert into user_preferences (user_id, theme, language, email_notifications, push_notifications)
    values (
      auth.uid(),
      coalesce(p_profile_data->'preferences'->>'theme', 'system'),
      coalesce(p_profile_data->'preferences'->>'language', 'fr'),
      coalesce((p_profile_data->'preferences'->>'email_notifications')::boolean, true),
      coalesce((p_profile_data->'preferences'->>'push_notifications')::boolean, true)
    )
    on conflict (user_id) do update set
      theme = excluded.theme,
      language = excluded.language,
      email_notifications = excluded.email_notifications,
      push_notifications = excluded.push_notifications,
      updated_at = now();
  end if;
  
  -- Log activity
  insert into user_activity_log (user_id, activity_type, metadata)
  values (auth.uid(), 'profile_updated', p_profile_data);
  
  return updated_profile;
end;
$$ language plpgsql security definer;
```

### RPC export_user_data
```sql
create or replace function export_user_data()
returns jsonb as $$
declare
  export_data jsonb;
begin
  select jsonb_build_object(
    'export_info', jsonb_build_object(
      'exported_at', now(),
      'user_id', auth.uid(),
      'export_version', '1.0'
    ),
    'profile', jsonb_build_object(
      'display_name', p.display_name,
      'created_at', p.created_at,
      'subscription_history', (
        select jsonb_agg(jsonb_build_object(
          'plan_type', plan_type,
          'started_at', created_at,
          'ended_at', expires_at,
          'status', status
        ))
        from user_subscriptions 
        where user_id = auth.uid()
      )
    ),
    'learning_data', jsonb_build_object(
      'statistics', (
        select jsonb_build_object(
          'total_ecos', total_ecos,
          'total_edn', total_edn,
          'total_study_hours', total_study_hours,
          'avg_score', avg_score
        )
        from user_statistics 
        where user_id = auth.uid()
      ),
      'activity_history', (
        select jsonb_agg(jsonb_build_object(
          'activity_type', activity_type,
          'item_id', item_id,
          'completed_at', completed_at,
          'score', metadata->>'score'
        ) order by completed_at desc)
        from user_activity_log
        where user_id = auth.uid()
        and created_at >= now() - interval '2 years' -- Limit to 2 years
      ),
      'progress_data', (
        select jsonb_agg(jsonb_build_object(
          'item_type', 'edn',
          'item_id', item_id,
          'completion_status', completion_status,
          'best_score', last_score,
          'study_time_seconds', study_time_seconds
        ))
        from user_edn_progress
        where user_id = auth.uid()
      )
    ),
    'preferences', (
      select jsonb_build_object(
        'theme', theme,
        'language', language,
        'notifications', jsonb_build_object(
          'email', email_notifications,
          'push', push_notifications
        )
      )
      from user_preferences
      where user_id = auth.uid()
    )
  ) into export_data
  from profiles p
  where p.id = auth.uid();
  
  -- Log export request
  insert into user_activity_log (user_id, activity_type, metadata)
  values (auth.uid(), 'data_exported', jsonb_build_object('export_size_kb', octet_length(export_data::text) / 1024));
  
  return export_data;
end;
$$ language plpgsql security definer;
```

## 8. Composants clés

### ProfileForm
```typescript
interface ProfileFormProps {
  initialData: UserProfile
  onSave: (data: ProfileData) => Promise<void>
}

export const ProfileForm = ({ initialData, onSave }) => {
  const form = useForm<ProfileData>({
    defaultValues: initialData,
    resolver: zodResolver(ProfileSchema)
  })
  
  const { uploadAvatar, uploading, preview } = useAvatarUpload()
  
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      await uploadAvatar(file)
      // Avatar URL will be updated via mutation success
    } catch (error) {
      toast.error(error.message)
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={preview || form.watch('avatar_url')} />
            <AvatarFallback>
              {form.watch('display_name')?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Upload className="h-4 w-4" />
                {uploading ? 'Upload en cours...' : 'Changer l\'avatar'}
              </div>
            </Label>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG ou WebP. Max 5MB.
            </p>
          </div>
        </div>
        
        {/* Profile Fields */}
        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom d'affichage</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>
                Pour changer votre email, contactez le support.
              </FormDescription>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={!form.formState.isDirty}>
          Sauvegarder les modifications
        </Button>
      </form>
    </Form>
  )
}
```

### SubscriptionSection
```typescript
interface SubscriptionSectionProps {
  subscription: UserSubscription | null
  onUpgrade: (planType: string) => void
  onCancel: () => void
}

export const SubscriptionSection = ({ subscription, onUpgrade, onCancel }) => {
  const plans = [
    {
      type: 'freemium',
      name: 'Gratuit',
      limits: { ecos: 5, edn: 10, features: ['Contenu de base'] }
    },
    {
      type: 'premium',
      name: 'Premium',
      price: '9.99€/mois',
      limits: { ecos: 'Illimité', edn: 'Illimité', features: ['Contenu premium', 'Mode immersif', 'Analytics avancés'] }
    }
  ]
  
  const currentPlan = plans.find(p => p.type === (subscription?.plan_type || 'freemium'))
  
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Plan actuel</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{currentPlan?.name}</p>
            {subscription?.expires_at && (
              <p className="text-sm text-muted-foreground">
                {subscription.status === 'active' ? 'Renouvelé' : 'Expire'} le{' '}
                {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
          
          <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
            {subscription?.status || 'gratuit'}
          </Badge>
        </div>
      </div>
      
      {currentPlan?.type === 'freemium' && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Passez au Premium</CardTitle>
            <CardDescription>
              Débloquez tout le contenu et les fonctionnalités avancées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {plans.find(p => p.type === 'premium')?.limits.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => onUpgrade('premium')} className="w-full">
              Upgrader maintenant - {plans.find(p => p.type === 'premium')?.price}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {subscription?.status === 'active' && subscription.plan_type !== 'freemium' && (
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Vous pouvez annuler votre abonnement à tout moment.
          </p>
          <Button variant="outline" onClick={onCancel}>
            Annuler l'abonnement
          </Button>
        </div>
      )}
    </div>
  )
}
```

## 9. Définition de Fini

✅ **Account page est "Done" quand :**
- [ ] Toutes les sections (profil, abonnement, préférences, activité, confidentialité) fonctionnelles
- [ ] Mise à jour profil avec optimistic updates + rollback
- [ ] Upload avatar avec optimisation + preview temps réel
- [ ] Changement mot de passe sécurisé avec validation
- [ ] Gestion abonnement (upgrade, downgrade, cancel)
- [ ] Historique d'activité paginé avec détails
- [ ] Export données RGPD complet et téléchargeable
- [ ] Suppression compte avec anonymisation
- [ ] États loading/empty/error pour toutes les sections
- [ ] Tests E2E : toutes les actions utilisateur testées
- [ ] Performance : sauvegarde < 1s, upload avatar < 5s
- [ ] Accessibilité : forms navigables, labels corrects
- [ ] Analytics : tracking toutes les actions compte
- [ ] Sécurité : validation côté client + serveur
- [ ] RLS : utilisateur modifie seulement ses données