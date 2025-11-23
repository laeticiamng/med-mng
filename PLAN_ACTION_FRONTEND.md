# 📋 PLAN D'ACTION DÉTAILLÉ - AMÉLIORATION FRONTEND MED-MNG

**Date de création :** 2025-11-23
**Durée estimée totale :** 4 semaines
**Priorité :** Haute

---

## 🎯 OBJECTIFS GLOBAUX

1. ✅ Améliorer la qualité du code (console.log, TypeScript errors)
2. ⚡ Optimiser les performances et réduire la taille du bundle
3. 🧪 Augmenter la couverture de tests
4. 📦 Réduire la complexité et la redondance des composants
5. 🔒 Renforcer la sécurité et la conformité
6. 📊 Établir des métriques de performance

---

## 📅 PHASE 1 : NETTOYAGE & QUALITÉ DU CODE (Semaine 1)

### 🎯 Objectif : Améliorer la qualité du code et résoudre les problèmes immédiats

**Durée estimée :** 5 jours
**Impact business :** 🔴 Critique
**Difficulté :** 🟢 Facile

---

### ✅ TÂCHE 1.1 : Supprimer les console.log en production

**Problème :** 132 occurrences de console.log/error/warn dans 30+ fichiers

**Actions :**

1. **Créer un plugin ESLint pour interdire console.log**

```bash
# Installer le plugin
pnpm add -D eslint-plugin-no-console
```

**Fichier `.eslintrc.js` :**
```javascript
module.exports = {
  plugins: ['no-console'],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }]
  }
}
```

2. **Remplacer tous les console.log par le logger existant**

**Commandes de remplacement :**
```bash
# Lister tous les fichiers avec console.log
grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" -l

# Script de remplacement automatique
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/console\.log/logger.debug/g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/console\.error/logger.error/g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/console\.warn/logger.warn/g' {} +
```

3. **Ajouter l'import du logger dans chaque fichier**

**Script Node.js** `scripts/add-logger-import.js` :
```javascript
const fs = require('fs');
const path = require('path');

const files = [
  // Liste des fichiers à modifier (générer avec grep)
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Ajouter l'import si logger est utilisé
  if (content.includes('logger.') && !content.includes("import { logger }")) {
    const lines = content.split('\n');
    const lastImportIndex = lines.findIndex(line => !line.startsWith('import'));
    lines.splice(lastImportIndex, 0, "import { logger } from '@/lib/logger';");
    content = lines.join('\n');
    fs.writeFileSync(file, content);
  }
});
```

4. **Améliorer le logger pour production**

**Fichier `src/lib/logger.ts` amélioré :**
```typescript
const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
    // Envoyer à Sentry en production
    if (!isDevelopment) {
      // Sentry.captureException(args[0]);
    }
  }
};
```

**Critères de succès :**
- ✅ 0 console.log dans le code source (sauf logger.ts)
- ✅ ESLint passe sans erreurs
- ✅ Logs conditionnels en dev only

**Temps estimé :** 1 jour

---

### ✅ TÂCHE 1.2 : Résoudre les erreurs TypeScript

**Problème :** Erreurs TypeScript liées aux modules non trouvés

**Actions :**

1. **Installer toutes les dépendances**
```bash
cd apps/frontend
pnpm install
```

2. **Vérifier les erreurs TypeScript**
```bash
npx tsc --noEmit
```

3. **Corriger les erreurs d'imports**

Si erreurs `Cannot find module 'react'` :
```bash
# Réinstaller les types
pnpm add -D @types/react@latest @types/react-dom@latest
```

4. **Corriger les erreurs de props Badge**

**Fichiers concernés :** AIRecommendations.tsx, AdvancedMixer.tsx, etc.

**Avant :**
```typescript
<Badge variant="secondary" className="...">
  {content}
</Badge>
```

**Après :**
```typescript
<Badge variant="secondary" className="...">
  <span>{content}</span>
</Badge>
```

5. **Ajouter les types manquants**
```bash
pnpm add -D @types/dompurify @types/react-window
```

**Critères de succès :**
- ✅ `npx tsc --noEmit` passe sans erreurs
- ✅ Build réussit : `pnpm run build`
- ✅ Pas d'erreurs TypeScript dans l'IDE

**Temps estimé :** 1 jour

---

### ✅ TÂCHE 1.3 : Standardiser les z-index

**Problème :** 11 fichiers avec z-index inconsistants

**Actions :**

1. **Créer l'échelle de z-index**

**Fichier `src/index.css` - ajouter :**
```css
@layer base {
  :root {
    /* Z-Index Scale */
    --z-base: 0;
    --z-dropdown: 1000;
    --z-sticky: 1020;
    --z-fixed: 1030;
    --z-modal-backdrop: 1040;
    --z-modal: 1050;
    --z-popover: 1060;
    --z-tooltip: 1070;
    --z-notification: 1080;
    --z-max: 9999;
  }
}
```

2. **Remplacer les z-index hardcodés**

**Commandes de recherche :**
```bash
# Trouver tous les z-index
grep -r "z-\[" src/ --include="*.tsx" --include="*.ts" -n

# Exemples de remplacement :
# z-50 → z-[var(--z-sticky)]
# z-40 → z-[var(--z-modal)]
```

3. **Créer des classes Tailwind pour z-index**

**Fichier `tailwind.config.ts` - ajouter :**
```typescript
extend: {
  zIndex: {
    'dropdown': 'var(--z-dropdown)',
    'sticky': 'var(--z-sticky)',
    'fixed': 'var(--z-fixed)',
    'modal-backdrop': 'var(--z-modal-backdrop)',
    'modal': 'var(--z-modal)',
    'popover': 'var(--z-popover)',
    'tooltip': 'var(--z-tooltip)',
    'notification': 'var(--z-notification)',
    'max': 'var(--z-max)',
  }
}
```

4. **Remplacer dans les composants**

**Avant :**
```tsx
<header className="sticky top-0 z-50">
```

**Après :**
```tsx
<header className="sticky top-0 z-sticky">
```

**Critères de succès :**
- ✅ Tous les z-index utilisent la scale
- ✅ Pas de conflits de superposition
- ✅ Documentation des z-index créée

**Temps estimé :** 0.5 jour

---

### ✅ TÂCHE 1.4 : Résoudre les TODOs/FIXMEs

**Problème :** 26 TODOs/FIXMEs dans 12 fichiers

**Actions :**

1. **Lister tous les TODOs**
```bash
grep -r "TODO\|FIXME\|XXX\|HACK\|BUG" src/ --include="*.ts" --include="*.tsx" -n > todos.txt
```

2. **Créer des issues GitHub**

**Script** `scripts/create-github-issues.sh` :
```bash
#!/bin/bash

# Exemple d'issue pour chaque TODO
gh issue create \
  --title "[TODO] Description du TODO" \
  --body "Fichier: src/path/to/file.ts:42\nDescription: ..." \
  --label "tech-debt,todo"
```

3. **Résoudre ou convertir en issues**

Priorités :
- **FIXME/BUG** → Résoudre immédiatement
- **TODO** → Créer issue + supprimer TODO
- **HACK** → Refactorer si possible

4. **Nettoyer les commentaires**
```bash
# Supprimer les TODOs une fois convertis en issues
# Faire manuellement avec verification
```

**Critères de succès :**
- ✅ 0 FIXME/BUG dans le code
- ✅ TODOs convertis en issues GitHub
- ✅ Plan de résolution créé

**Temps estimé :** 1 jour

---

### ✅ TÂCHE 1.5 : Configurer les pre-commit hooks

**Actions :**

1. **Installer Husky**
```bash
pnpm add -D husky lint-staged
npx husky init
```

2. **Configurer pre-commit**

**Fichier `.husky/pre-commit` :**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm run lint-staged
```

3. **Configurer lint-staged**

**Fichier `package.json` - ajouter :**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

4. **Installer Prettier**
```bash
pnpm add -D prettier
```

**Fichier `.prettierrc` :**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Critères de succès :**
- ✅ Pre-commit hooks fonctionnels
- ✅ Code formaté automatiquement
- ✅ Linting automatique avant commit

**Temps estimé :** 0.5 jour

---

## 📅 PHASE 2 : OPTIMISATION DES PERFORMANCES (Semaine 2)

### 🎯 Objectif : Optimiser le bundle et améliorer les performances

**Durée estimée :** 5 jours
**Impact business :** 🟡 Important
**Difficulté :** 🟡 Moyen

---

### ✅ TÂCHE 2.1 : Analyser le bundle

**Actions :**

1. **Installer les outils d'analyse**
```bash
pnpm add -D rollup-plugin-visualizer vite-bundle-visualizer
```

2. **Configurer Vite pour analyse**

**Fichier `vite.config.ts` - ajouter :**
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... autres plugins
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
});
```

3. **Build et analyser**
```bash
pnpm run build
# Ouvre automatiquement stats.html
```

4. **Identifier les problèmes**

Chercher :
- Packages > 500kb
- Duplications de code
- Imports non tree-shakés
- Librairies entières importées pour une fonction

**Critères de succès :**
- ✅ Bundle visualisé et analysé
- ✅ Top 10 des gros packages identifiés
- ✅ Plan d'optimisation créé

**Temps estimé :** 0.5 jour

---

### ✅ TÂCHE 2.2 : Optimiser les imports

**Actions :**

1. **Remplacer les imports barrel**

**Avant :**
```typescript
import { Button, Card, Badge, ... } from '@/components/ui';
```

**Après :**
```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
```

2. **Utiliser les imports spécifiques pour lodash**

**Avant :**
```typescript
import _ from 'lodash';
_.debounce(...);
```

**Après :**
```typescript
import debounce from 'lodash/debounce';
```

3. **Lazy load les composants lourds**

**Exemple pour Chart.js :**
```typescript
const ChartComponent = lazy(() => import('./ChartComponent'));

// Dans le render
{showChart && (
  <Suspense fallback={<Skeleton className="h-64" />}>
    <ChartComponent />
  </Suspense>
)}
```

4. **Optimiser Lucide React**

**Avant :**
```typescript
import * as Icons from 'lucide-react';
```

**Après :**
```typescript
import { User, Settings, Bell } from 'lucide-react';
```

**Critères de succès :**
- ✅ Réduction de 20% minimum du bundle
- ✅ Tree-shaking effectif
- ✅ Pas d'imports barrel

**Temps estimé :** 2 jours

---

### ✅ TÂCHE 2.3 : Optimiser les images

**Actions :**

1. **Installer sharp pour conversion**
```bash
pnpm add -D sharp
```

2. **Script de conversion images**

**Fichier `scripts/optimize-images.js` :**
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imageDir = './public';
const outputDir = './public/optimized';

// Convertir en WebP et AVIF
fs.readdirSync(imageDir).forEach(file => {
  if (file.match(/\.(jpg|jpeg|png)$/)) {
    const input = path.join(imageDir, file);
    const nameWithoutExt = path.parse(file).name;

    // WebP
    sharp(input)
      .webp({ quality: 80 })
      .toFile(path.join(outputDir, `${nameWithoutExt}.webp`));

    // AVIF (meilleure compression)
    sharp(input)
      .avif({ quality: 70 })
      .toFile(path.join(outputDir, `${nameWithoutExt}.avif`));
  }
});
```

3. **Utiliser picture tag**

**Avant :**
```tsx
<img src="/image.jpg" alt="..." />
```

**Après :**
```tsx
<picture>
  <source srcSet="/optimized/image.avif" type="image/avif" />
  <source srcSet="/optimized/image.webp" type="image/webp" />
  <img src="/image.jpg" alt="..." loading="lazy" />
</picture>
```

4. **Créer un composant Image optimisé**

**Fichier `src/components/ui/OptimizedImage.tsx` :**
```typescript
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  loading = 'lazy'
}) => {
  const basePath = src.replace(/\.[^.]+$/, '');

  return (
    <picture>
      <source srcSet={`${basePath}.avif`} type="image/avif" />
      <source srcSet={`${basePath}.webp`} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
      />
    </picture>
  );
};
```

**Critères de succès :**
- ✅ Toutes les images converties en WebP/AVIF
- ✅ Lazy loading activé
- ✅ Réduction de 50%+ de la taille images

**Temps estimé :** 1 jour

---

### ✅ TÂCHE 2.4 : Implémenter le performance budget

**Actions :**

1. **Configurer les limites dans Vite**

**Fichier `vite.config.ts` - ajouter :**
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // ... existant
      }
    }
  },
  // Alertes de taille
  chunkSizeWarningLimit: 500, // Réduit de 1000 à 500kb
}
```

2. **Créer un script de vérification**

**Fichier `scripts/check-bundle-size.js` :**
```javascript
const fs = require('fs');
const path = require('path');

const distDir = './dist/js';
const maxChunkSize = 500 * 1024; // 500kb

fs.readdirSync(distDir).forEach(file => {
  const filePath = path.join(distDir, file);
  const stats = fs.statSync(filePath);

  if (stats.size > maxChunkSize) {
    console.error(`❌ ${file} exceeds 500kb: ${(stats.size / 1024).toFixed(2)}kb`);
    process.exit(1);
  } else {
    console.log(`✅ ${file}: ${(stats.size / 1024).toFixed(2)}kb`);
  }
});
```

3. **Ajouter au CI/CD**

**Fichier `.github/workflows/ci.yml` :**
```yaml
- name: Check bundle size
  run: |
    pnpm run build
    node scripts/check-bundle-size.js
```

**Critères de succès :**
- ✅ Alertes automatiques si budget dépassé
- ✅ Chunks < 500kb
- ✅ Bundle total < 2mb (gzipped)

**Temps estimé :** 0.5 jour

---

### ✅ TÂCHE 2.5 : Optimiser les Core Web Vitals

**Actions :**

1. **Installer web-vitals**
```bash
# Déjà installé : web-vitals@5.1.0
```

2. **Améliorer le monitoring**

**Fichier `src/utils/webVitals.ts` - améliorer :**
```typescript
import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // Envoyer à Google Analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
    });
  }

  // Aussi logger en dev
  console.log(metric);
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

3. **Optimiser LCP (Largest Contentful Paint)**

- Précharger fonts critiques
- Lazy load images non critiques
- Optimiser le CSS critique

**Fichier `index.html` - ajouter :**
```html
<head>
  <!-- Preload critical fonts -->
  <link rel="preload" href="/fonts/sf-pro-display.woff2" as="font" type="font/woff2" crossorigin>

  <!-- Preconnect to API -->
  <link rel="preconnect" href="https://api.supabase.co">
  <link rel="dns-prefetch" href="https://api.supabase.co">
</head>
```

4. **Optimiser CLS (Cumulative Layout Shift)**

- Ajouter dimensions explicites aux images
- Réserver espace pour skeleton loaders
- Éviter injections dynamiques de contenu

**Exemple :**
```tsx
// Avant
<Suspense fallback={<div>Loading...</div>}>

// Après
<Suspense fallback={<Skeleton className="h-64 w-full" />}>
```

5. **Créer des skeletons pour toutes les pages**

**Fichier `src/components/ui/PageSkeleton.tsx` :**
```typescript
export const PageSkeleton: React.FC = () => (
  <div className="container mx-auto p-4 space-y-4">
    <Skeleton className="h-12 w-64" />
    <Skeleton className="h-64 w-full" />
    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
  </div>
);
```

**Critères de succès :**
- ✅ LCP < 2.5s
- ✅ FID < 100ms
- ✅ CLS < 0.1
- ✅ Score Lighthouse > 90

**Temps estimé :** 1 jour

---

## 📅 PHASE 3 : RÉDUCTION DE LA COMPLEXITÉ (Semaine 3)

### 🎯 Objectif : Réduire la redondance et simplifier l'architecture

**Durée estimée :** 5 jours
**Impact business :** 🟢 Moyen
**Difficulté :** 🔴 Difficile

---

### ✅ TÂCHE 3.1 : Audit des composants

**Problème :** 577 composants suggèrent potentiellement de la redondance

**Actions :**

1. **Analyser l'utilisation des composants**

**Script `scripts/analyze-components.js` :**
```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const componentsDir = './src/components';
const components = [];

// Lister tous les composants
function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx')) {
      const componentName = path.parse(file).name;

      // Compter les imports de ce composant
      const grep = `grep -r "from.*${componentName}" src/ | wc -l`;
      const usageCount = parseInt(execSync(grep).toString().trim());

      components.push({
        name: componentName,
        path: filePath,
        usageCount,
        size: fs.statSync(filePath).size
      });
    }
  });
}

walkDir(componentsDir);

// Trier par usage
components.sort((a, b) => a.usageCount - b.usageCount);

// Générer rapport
const unused = components.filter(c => c.usageCount === 0);
const lowUsage = components.filter(c => c.usageCount === 1);

console.log(`📊 Analyse des ${components.length} composants:`);
console.log(`❌ Inutilisés: ${unused.length}`);
console.log(`⚠️  Usage faible (1x): ${lowUsage.length}`);

// Sauvegarder rapport
fs.writeFileSync('component-analysis.json', JSON.stringify({
  total: components.length,
  unused,
  lowUsage,
  allComponents: components
}, null, 2));
```

2. **Exécuter l'analyse**
```bash
node scripts/analyze-components.js
```

3. **Identifier les doublons**

**Script `scripts/find-duplicates.js` :**
```javascript
// Utiliser jscpd pour détecter code dupliqué
const { execSync } = require('child_process');

execSync('npx jscpd src/components --min-lines 10 --format json -o duplicates.json');

// Analyser le rapport
const duplicates = require('./duplicates.json');
console.log(`🔍 ${duplicates.statistics.total.duplicates} duplications trouvées`);
```

4. **Créer un plan de consolidation**

**Fichier `COMPONENT_CLEANUP_PLAN.md` :**
```markdown
# Plan de nettoyage des composants

## À supprimer (unused)
- [ ] ComponentA (0 usages)
- [ ] ComponentB (0 usages)

## À fusionner (duplicates)
- [ ] Dashboard1 + Dashboard2 → UnifiedDashboard
- [ ] Card1 + Card2 → Card

## À refactorer (trop gros)
- [ ] HugeComponent (500+ lignes) → extraire en sous-composants
```

**Critères de succès :**
- ✅ Rapport d'analyse généré
- ✅ Liste des composants inutilisés
- ✅ Plan de consolidation créé

**Temps estimé :** 2 jours

---

### ✅ TÂCHE 3.2 : Supprimer les composants inutilisés

**Actions :**

1. **Créer une branche dédiée**
```bash
git checkout -b cleanup/remove-unused-components
```

2. **Supprimer progressivement**

**Process :**
- Commencer par les composants avec 0 usage
- Vérifier avec tests que rien ne casse
- Commit par groupe de 10 composants

```bash
# Supprimer et tester
rm src/components/unused/ComponentA.tsx
pnpm run build
pnpm run test

git add .
git commit -m "cleanup: remove unused ComponentA"
```

3. **Mettre à jour les imports**
```bash
# Vérifier qu'il n'y a pas d'imports cassés
pnpm run build
```

4. **Créer une PR**
```bash
git push origin cleanup/remove-unused-components
gh pr create --title "Cleanup: Remove unused components" --body "Removes 50+ unused components identified in audit"
```

**Critères de succès :**
- ✅ 50+ composants inutilisés supprimés
- ✅ Build réussit
- ✅ Tests passent

**Temps estimé :** 1 jour

---

### ✅ TÂCHE 3.3 : Consolider les pages similaires

**Problème :** 178 pages potentiellement redondantes

**Actions :**

1. **Identifier les pages similaires**

Exemples :
- Dashboard, ModularDashboard, LearningDashboard → UnifiedDashboard
- NotificationsCenter, NotificationsPage → Notifications
- SearchGlobal, SearchResults, AdvancedSearch → Search

2. **Créer des layouts réutilisables**

**Fichier `src/layouts/DashboardLayout.tsx` :**
```typescript
interface DashboardLayoutProps {
  title: string;
  widgets: Widget[];
  sidebar?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  widgets,
  sidebar
}) => (
  <div className="dashboard-layout">
    <header>
      <h1>{title}</h1>
    </header>
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-3">{sidebar}</aside>
      <main className="col-span-9">
        {widgets.map(widget => (
          <Widget key={widget.id} {...widget} />
        ))}
      </main>
    </div>
  </div>
);
```

3. **Refactorer les pages en configuration**

**Avant (3 pages séparées) :**
```typescript
// Dashboard.tsx (200 lignes)
// ModularDashboard.tsx (180 lignes)
// LearningDashboard.tsx (190 lignes)
```

**Après (1 page + configs) :**
```typescript
// pages/Dashboard.tsx
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { dashboardConfigs } from '@/config/dashboards';

export const Dashboard: React.FC = () => {
  const type = useParams().type || 'default';
  const config = dashboardConfigs[type];

  return <DashboardLayout {...config} />;
};

// config/dashboards.ts
export const dashboardConfigs = {
  default: { title: 'Dashboard', widgets: [...] },
  modular: { title: 'Modular Dashboard', widgets: [...] },
  learning: { title: 'Learning Dashboard', widgets: [...] },
};
```

4. **Migrer progressivement**
```bash
# Branche par type de page
git checkout -b refactor/consolidate-dashboards
git checkout -b refactor/consolidate-search
git checkout -b refactor/consolidate-notifications
```

**Critères de succès :**
- ✅ Réduction de 30% du nombre de pages
- ✅ Layouts réutilisables créés
- ✅ Maintenance simplifiée

**Temps estimé :** 2 jours

---

## 📅 PHASE 4 : TESTS & QUALITÉ (Semaine 4)

### 🎯 Objectif : Augmenter la couverture de tests à 70%+

**Durée estimée :** 5 jours
**Impact business :** 🟡 Important
**Difficulté :** 🟡 Moyen

---

### ✅ TÂCHE 4.1 : Configurer la couverture de tests

**Actions :**

1. **Configurer Vitest coverage**

**Fichier `vite.config.ts` - ajouter :**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/'
      ],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    }
  }
});
```

2. **Ajouter scripts de test**

**Fichier `package.json` - ajouter :**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:coverage:watch": "vitest --coverage --watch"
  }
}
```

3. **Créer le fichier setup**

**Fichier `src/tests/setup.ts` :**
```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
};
```

4. **Lancer les tests avec coverage**
```bash
pnpm run test:coverage
```

**Critères de succès :**
- ✅ Coverage configuré
- ✅ Rapport HTML généré
- ✅ Baseline établi

**Temps estimé :** 0.5 jour

---

### ✅ TÂCHE 4.2 : Tester les composants UI critiques

**Actions :**

1. **Créer tests pour les composants de base**

**Fichier `src/components/ui/Button.test.tsx` :**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-destructive');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
```

2. **Tester les composants prioritaires**

**Liste des composants à tester en priorité :**
- ✅ Button
- ✅ Card
- ✅ Dialog
- ✅ Form
- ✅ Input
- ✅ Select
- ✅ Toast
- ✅ Tooltip

**Template de test :**
```typescript
// src/components/ui/[Component].test.tsx
describe('[Component]', () => {
  it('renders correctly');
  it('handles user interactions');
  it('applies props correctly');
  it('handles edge cases');
  it('is accessible');
});
```

3. **Générer tests automatiquement avec AI**

**Utiliser GitHub Copilot ou autre :**
```bash
# Créer un script pour générer les tests basiques
pnpm add -D @testing-library/react @testing-library/user-event
```

**Critères de succès :**
- ✅ 68 composants UI testés
- ✅ Coverage composants > 80%
- ✅ Tests accessibility passent

**Temps estimé :** 2 jours

---

### ✅ TÂCHE 4.3 : Tester les hooks personnalisés

**Actions :**

1. **Créer tests pour hooks critiques**

**Fichier `src/hooks/useAuth.test.ts` :**
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user when authenticated', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('handles sign in', async () => {
    const { result } = renderHook(() => useAuth());

    await result.current.signIn('test@example.com', 'password');

    expect(result.current.user).toBeDefined();
  });

  it('handles sign out', async () => {
    const { result } = renderHook(() => useAuth());

    await result.current.signOut();

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

2. **Hooks prioritaires à tester :**
- useAuth
- useApi
- useEdnItems
- useMusicGeneration
- useSubscription
- useUserProfile
- useQuizProgress
- useGoals

3. **Utiliser msw pour mocker les APIs**

**Fichier `src/tests/mocks/handlers.ts` :**
```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/api/user', () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    });
  }),

  http.post('*/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    return HttpResponse.json({
      token: 'fake-jwt-token',
      user: { email }
    });
  }),
];
```

**Critères de succès :**
- ✅ 20+ hooks critiques testés
- ✅ Coverage hooks > 70%
- ✅ Tests asynchrones robustes

**Temps estimé :** 1.5 jours

---

### ✅ TÂCHE 4.4 : Tests d'intégration

**Actions :**

1. **Tester les flows utilisateurs critiques**

**Fichier `src/tests/integration/auth-flow.test.tsx` :**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';

describe('Authentication Flow', () => {
  it('allows user to sign in', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Navigate to login
    fireEvent.click(screen.getByText('Se connecter'));

    // Fill form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), {
      target: { value: 'password123' }
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Connexion' }));

    // Check redirect
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
```

2. **Flows prioritaires :**
- ✅ Authentification (login, signup, logout)
- ✅ Navigation EDN (liste → détail → quiz)
- ✅ Génération musicale (config → génération → lecture)
- ✅ Panier (ajout → checkout → paiement)
- ✅ Profil utilisateur (édition → sauvegarde)

3. **Tests E2E avec Playwright**

```bash
pnpm add -D @playwright/test
npx playwright install
```

**Fichier `e2e/auth.spec.ts` :**
```typescript
import { test, expect } from '@playwright/test';

test('user can sign in', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.click('text=Se connecter');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password123');
  await page.click('button:has-text("Connexion")');
  await expect(page).toHaveURL('/dashboard');
});
```

**Critères de succès :**
- ✅ 10+ tests d'intégration
- ✅ 5+ tests E2E critiques
- ✅ CI/CD avec tests E2E

**Temps estimé :** 1 jour

---

## 📅 PHASE BONUS : MONITORING & DOCUMENTATION

### ✅ TÂCHE BONUS 1 : Configurer le monitoring en production

**Actions :**

1. **Améliorer Sentry**

**Fichier `src/utils/sentry.ts` - améliorer :**
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,

  // Performance monitoring
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Performance
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Filtering
  beforeSend(event, hint) {
    // Ne pas envoyer les erreurs de développement
    if (import.meta.env.DEV) return null;

    // Filtrer les erreurs connues
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null;
    }

    return event;
  },
});
```

2. **Ajouter Google Analytics 4**

**Fichier `index.html` :**
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    send_page_view: false // Handle manually in React
  });
</script>
```

**Fichier `src/utils/analytics.ts` :**
```typescript
export const trackPageView = (path: string) => {
  if (window.gtag) {
    window.gtag('config', 'G-XXXXXXXXXX', {
      page_path: path,
    });
  }
};

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
```

3. **Tracker les événements business**

**Dans les composants :**
```typescript
import { trackEvent } from '@/utils/analytics';

// User generated music
const handleGenerateMusic = async () => {
  trackEvent('generate_music', 'Music', 'EDN Item ' + itemId);
  // ...
};

// User completed quiz
const handleQuizComplete = () => {
  trackEvent('quiz_complete', 'Learning', 'EDN Item ' + itemId, score);
};
```

**Temps estimé :** 1 jour

---

### ✅ TÂCHE BONUS 2 : Documentation technique

**Actions :**

1. **Créer le README technique**

**Fichier `apps/frontend/README.md` :**
```markdown
# MED-MNG Frontend

## Architecture

### Stack
- React 18.3.1
- TypeScript 5.5.3
- Vite 5.4.1
- Tailwind CSS 3.4.11

### Structure
\`\`\`
src/
├── components/     # 577 composants réutilisables
├── pages/         # 178 pages de l'application
├── hooks/         # 150+ custom hooks
├── contexts/      # 7 React contexts
├── lib/           # Utilitaires
└── config/        # Configuration
\`\`\`

## Développement

### Installation
\`\`\`bash
pnpm install
\`\`\`

### Démarrage
\`\`\`bash
pnpm run dev
\`\`\`

### Build
\`\`\`bash
pnpm run build
\`\`\`

### Tests
\`\`\`bash
pnpm run test
pnpm run test:coverage
\`\`\`

## Conventions

### Composants
- Utiliser TypeScript
- Props typées avec interfaces
- Export named par défaut
- Tests unitaires obligatoires

### Hooks
- Préfixer avec \`use\`
- Documenter les dépendances
- Cleanup dans useEffect

### Styles
- Tailwind utility-first
- Variables CSS pour couleurs
- Responsive mobile-first
```

2. **Documenter les composants avec Storybook**

```bash
# Démarrer Storybook
pnpm run storybook
```

**Créer stories pour composants UI :**
```typescript
// src/components/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};
```

3. **Créer l'ADR (Architecture Decision Records)**

**Fichier `docs/adr/001-use-react-query.md` :**
```markdown
# ADR 001: Utiliser TanStack React Query pour le state management serveur

## Status
Accepted

## Context
Besoin de gérer l'état serveur (API calls, caching, synchronization)

## Decision
Utiliser TanStack React Query v5

## Consequences
**Positives:**
- Caching automatique
- Invalidation optimiste
- Persistence IndexedDB
- DevTools intégrés

**Négatives:**
- Courbe d'apprentissage
- Bundle size +50kb
```

**Temps estimé :** 1 jour

---

## 📊 TABLEAU RÉCAPITULATIF

| Phase | Tâches | Durée | Impact | Difficulté |
|-------|--------|-------|---------|-----------|
| **Phase 1: Qualité** | 5 tâches | 5 jours | 🔴 Critique | 🟢 Facile |
| 1.1 | Console.log cleanup | 1j | 🔴 | 🟢 |
| 1.2 | TypeScript errors | 1j | 🔴 | 🟢 |
| 1.3 | Z-index standardization | 0.5j | 🟡 | 🟢 |
| 1.4 | TODO cleanup | 1j | 🟡 | 🟢 |
| 1.5 | Pre-commit hooks | 0.5j | 🟡 | 🟢 |
| **Phase 2: Performance** | 5 tâches | 5 jours | 🟡 Important | 🟡 Moyen |
| 2.1 | Bundle analysis | 0.5j | 🟡 | 🟢 |
| 2.2 | Import optimization | 2j | 🟡 | 🟡 |
| 2.3 | Image optimization | 1j | 🟡 | 🟢 |
| 2.4 | Performance budget | 0.5j | 🟡 | 🟢 |
| 2.5 | Core Web Vitals | 1j | 🟡 | 🟡 |
| **Phase 3: Complexité** | 3 tâches | 5 jours | 🟢 Moyen | 🔴 Difficile |
| 3.1 | Component audit | 2j | 🟢 | 🟡 |
| 3.2 | Remove unused | 1j | 🟢 | 🟢 |
| 3.3 | Consolidate pages | 2j | 🟢 | 🔴 |
| **Phase 4: Tests** | 4 tâches | 5 jours | 🟡 Important | 🟡 Moyen |
| 4.1 | Coverage setup | 0.5j | 🟡 | 🟢 |
| 4.2 | Component tests | 2j | 🟡 | 🟡 |
| 4.3 | Hook tests | 1.5j | 🟡 | 🟡 |
| 4.4 | Integration tests | 1j | 🟡 | 🟡 |
| **Bonus** | 2 tâches | 2 jours | 🟢 Nice-to-have | 🟢 Facile |

**TOTAL : 22 jours de travail**

---

## 🎯 MÉTRIQUES DE SUCCÈS

### Avant / Après

| Métrique | Avant | Objectif | Impact |
|----------|-------|----------|---------|
| **Console.log** | 132 | 0 | Code propre |
| **TypeScript errors** | ? | 0 | Type safety |
| **Bundle size** | ? | <2MB gzip | Performance |
| **Components** | 577 | <450 | Maintenabilité |
| **Pages** | 178 | <125 | Simplicité |
| **Test coverage** | ? | >70% | Qualité |
| **Lighthouse score** | ? | >90 | UX |
| **LCP** | ? | <2.5s | Performance |
| **CLS** | ? | <0.1 | Stabilité |

---

## 🚀 CHECKLIST GLOBALE

### Phase 1 : Qualité (Semaine 1)
- [ ] Console.log supprimés (0 restants)
- [ ] Erreurs TypeScript résolues (0 erreurs)
- [ ] Z-index standardisés (échelle créée)
- [ ] TODOs convertis en issues (0 dans le code)
- [ ] Pre-commit hooks configurés

### Phase 2 : Performance (Semaine 2)
- [ ] Bundle analysé (rapport généré)
- [ ] Imports optimisés (tree-shaking ok)
- [ ] Images converties WebP/AVIF
- [ ] Performance budget établi (<500kb/chunk)
- [ ] Core Web Vitals optimisés (LCP<2.5s, CLS<0.1)

### Phase 3 : Complexité (Semaine 3)
- [ ] Audit composants complété
- [ ] Composants inutilisés supprimés (50+)
- [ ] Pages consolidées (30%+ réduction)
- [ ] Layouts réutilisables créés

### Phase 4 : Tests (Semaine 4)
- [ ] Coverage configuré (rapport HTML)
- [ ] Composants UI testés (68 composants)
- [ ] Hooks testés (20+ hooks)
- [ ] Tests intégration (10+ flows)
- [ ] Coverage >70%

### Bonus
- [ ] Monitoring prod (Sentry + GA4)
- [ ] Documentation (README + Storybook + ADR)

---

## 📞 CONTACTS & SUPPORT

**Questions techniques :** [Créer une issue GitHub]
**Revue de code :** [Demander une PR review]
**Documentation :** `apps/frontend/README.md`

---

**Dernière mise à jour :** 2025-11-23
**Auteur :** Claude (Audit Frontend)
**Version :** 1.0
