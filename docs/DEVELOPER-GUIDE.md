# 🛠️ GUIDE CONTRIBUTION & DÉVELOPPEMENT

**Version :** 1.0.0  
**Date :** 28 Juillet 2025  
**Audience :** Développeurs, contributeurs

---

## 🎯 BIENVENUE CONTRIBUTEURS

### Contribution rapide (< 30 min)
1. **Fork** le repository
2. **Clone** localement : `git clone`
3. **Install** : `pnpm install`
4. **Develop** : `pnpm dev`
5. **Test** : `pnpm test`
6. **Submit** : Pull Request

### 📋 Types de contributions
- 🐛 **Bug fixes** : Corrections de bugs
- ✨ **Features** : Nouvelles fonctionnalités
- 📚 **Documentation** : Améliorations docs
- 🧪 **Tests** : Couverture de tests
- 🎨 **UI/UX** : Améliorations interface
- ⚡ **Performance** : Optimisations

---

## 🏗️ ARCHITECTURE DE DÉVELOPPEMENT

### Structure des dossiers
```
📂 med-mng/
├── 📂 src/
│   ├── 📂 components/         # Composants React
│   │   ├── 📂 ui/            # Design system
│   │   ├── 📂 admin/         # Interface admin
│   │   ├── 📂 edn/           # Composants EDN
│   │   └── 📂 med-mng/       # Composants musicaux
│   ├── 📂 pages/             # Pages principales
│   ├── 📂 hooks/             # Hooks personnalisés
│   ├── 📂 lib/               # Utilitaires
│   └── 📂 integrations/      # Intégrations APIs
├── 📂 supabase/
│   ├── 📂 functions/         # Edge Functions
│   └── 📂 migrations/        # Migrations DB
├── 📂 docs/                  # Documentation
├── 📂 tests/                 # Tests E2E
└── 📂 scripts/               # Scripts utilitaires
```

### 🛡️ Standards de qualité
- **TypeScript** strict mode
- **ESLint** + **Prettier** 
- **Tests E2E** Playwright
- **Coverage** > 80%
- **Performance** Lighthouse > 90

---

## 🚀 ENVIRONNEMENT DE DÉVELOPPEMENT

### Prérequis
```bash
Node.js >= 20.0.0
pnpm >= 8.0.0
Git >= 2.30.0
```

### Installation complète
```bash
# 1. Cloner le repository
git clone https://github.com/med-mng/med-mng.git
cd med-mng

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# 4. Démarrer Supabase local (optionnel)
supabase start

# 5. Lancer en développement
pnpm dev
```

### 🔧 Scripts disponibles
```bash
# Développement
pnpm dev                    # Serveur dev
pnpm build                  # Build production
pnpm preview               # Preview build

# Qualité
pnpm lint                  # ESLint
pnpm format               # Prettier
pnpm type-check           # TypeScript

# Tests
pnpm test                 # Tests unitaires
pnpm test:e2e            # Tests E2E
pnpm test:coverage       # Coverage

# Base de données
pnpm db:reset            # Reset DB locale
pnpm db:migrate          # Appliquer migrations
pnpm db:seed             # Données de test

# Audit
pnpm audit               # Audit complet
pnpm security:scan       # Scan sécurité
```

---

## 📝 STANDARDS DE CODE

### TypeScript Guidelines
```typescript
// ✅ BIEN - Types explicites
interface MedicalItem {
  id: string;
  code: string;
  title: string;
  specialty: MedicalSpecialty;
}

// ✅ BIEN - Hooks personnalisés typés
const useEdnItem = (itemCode: string): UseEdnItemResult => {
  // ... logique
}

// ❌ ÉVITER - Types any
const data: any = fetchData();
```

### React Components
```tsx
// ✅ BIEN - Composant fonctionnel typé
interface EdnItemCardProps {
  item: EdnItem;
  onSelect: (id: string) => void;
  className?: string;
}

export const EdnItemCard: React.FC<EdnItemCardProps> = ({
  item,
  onSelect,
  className
}) => {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      {/* ... contenu */}
    </Card>
  );
};
```

### Naming Conventions
- **Variables** : `camelCase`
- **Composants** : `PascalCase`
- **Fichiers** : `kebab-case.tsx`
- **Types** : `PascalCase`
- **Constants** : `SCREAMING_SNAKE_CASE`

---

## 🎨 DESIGN SYSTEM

### Utilisation des tokens
```tsx
// ✅ BIEN - Utiliser le design system
<Button variant="primary" size="lg">
  Générer musique
</Button>

<Card className="bg-card border-border">
  <CardHeader className="text-card-foreground">
    {/* ... */}
  </CardHeader>
</Card>

// ❌ ÉVITER - Styles directs
<button className="bg-blue-500 text-white px-4 py-2">
  Bouton
</button>
```

### Création de nouveaux composants
```tsx
// Utiliser class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        medical: "bg-accent text-accent-foreground hover:bg-accent-hover"
      },
      size: {
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8 text-base"
      }
    }
  }
);
```

---

## 🧪 TESTS & QUALITÉ

### Tests E2E (Playwright)
```typescript
// tests/e2e/edn-navigation.spec.ts
test('Navigation EDN complète', async ({ page }) => {
  await page.goto('/edn');
  
  // Tester la recherche
  await page.fill('[data-testid="search-input"]', 'hypertension');
  await page.click('[data-testid="search-button"]');
  
  // Vérifier les résultats
  await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  
  // Tester la navigation
  await page.click('[data-testid="item-ic-221"]');
  await expect(page.locator('h1')).toContainText('IC-221');
});
```

### Tests de performance
```typescript
// tests/performance/music-generation.spec.ts
test('Performance génération musicale', async ({ page }) => {
  await page.goto('/med-mng/create');
  
  // Démarrer mesure de performance
  const startTime = Date.now();
  
  await page.fill('[data-testid="prompt-input"]', 'Musique relaxante');
  await page.click('[data-testid="generate-button"]');
  
  // Attendre la génération
  await page.waitForSelector('[data-testid="audio-player"]');
  
  const endTime = Date.now();
  expect(endTime - startTime).toBeLessThan(60000); // < 60s
});
```

---

## 📊 MONITORING & DEBUG

### Debugging local
```bash
# Logs détaillés
DEBUG=* pnpm dev

# Logs Supabase
supabase functions logs --function-name content-ai-generator

# Analyse bundle
pnpm build --analyze
```

### Performance monitoring
```typescript
// utils/performance.ts
export const measurePerformance = (name: string) => {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
  };
};

// Usage dans composants
const stopMeasure = measurePerformance('Music Generation');
// ... logique
stopMeasure();
```

---

## 🔄 WORKFLOW DE CONTRIBUTION

### 1. Préparation
```bash
# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Ou une branche fix
git checkout -b fix/correction-bug
```

### 2. Développement
```bash
# Développer avec tests
pnpm dev
pnpm test:watch

# Commits atomiques
git add .
git commit -m "feat: ajouter génération musicale par spécialité"
```

### 3. Quality Gates
```bash
# Vérifications obligatoires
pnpm lint              # ✅ Linting
pnpm type-check        # ✅ TypeScript
pnpm test              # ✅ Tests unitaires
pnpm test:e2e          # ✅ Tests E2E
pnpm build             # ✅ Build réussi
```

### 4. Pull Request
```markdown
## 📝 Description
Ajout de la génération musicale par spécialité médicale

## 🧪 Tests
- [x] Tests unitaires ajoutés
- [x] Tests E2E mis à jour
- [x] Tests manuels effectués

## 🔄 Breaking Changes
- Aucun

## 📸 Screenshots
[Screenshots si UI]
```

---

## 🎯 GUIDELINES SPÉCIFIQUES

### Edge Functions
```typescript
// supabase/functions/nouvelle-fonction/index.ts
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validation
    const apiKey = Deno.env.get('API_KEY');
    if (!apiKey) {
      throw new Error('API_KEY manquant');
    }

    // Logique métier
    const result = await processRequest();

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
```

### Database Migrations
```sql
-- supabase/migrations/20250728000000_nouvelle_feature.sql

-- Créer nouvelle table avec RLS
CREATE TABLE IF NOT EXISTS public.nouvelle_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.nouvelle_table ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can manage their own data"
ON public.nouvelle_table
FOR ALL
USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE TRIGGER update_nouvelle_table_updated_at
  BEFORE UPDATE ON public.nouvelle_table
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

## 🚀 DÉPLOIEMENT

### Environnements
- **Development** : Branch develop → Auto-deploy
- **Staging** : Branch main → Auto-deploy  
- **Production** : Release tags → Manual approve

### Checklist déploiement
- [ ] Tests E2E passent
- [ ] Audit sécurité clean
- [ ] Performance validée
- [ ] Documentation mise à jour
- [ ] Migrations testées
- [ ] Rollback plan défini

---

## 📞 SUPPORT DÉVELOPPEURS

### Ressources
- 📚 [Documentation complète](./docs/)
- 🐛 [Issues GitHub](https://github.com/med-mng/med-mng/issues)
- 💬 [Discord développeurs](https://discord.gg/med-mng-dev)
- 📧 **Email** : dev-support@med-mng.com

### Code reviews
- **Délai** : 24-48h
- **Critères** : Code quality, tests, sécurité
- **Approbation** : 2 reviewers minimum

---

*Guide développeur mis à jour le 28 Juillet 2025*  
*Merci de contribuer à MED-MNG ! 🚀*