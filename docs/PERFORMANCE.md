# ⚡ Guide de Performance - MedMng Platform

## 📊 Métriques de Performance

### Core Web Vitals

Nous mesurons et optimisons trois métriques clés :

#### 🎯 Largest Contentful Paint (LCP)
- **Budget**: < 2.5s
- **Objectif**: Chargement rapide du contenu principal
- **Mesure**: Temps de rendu du plus grand élément visible

#### ⚡ First Input Delay (FID)
- **Budget**: < 100ms
- **Objectif**: Interactivité immédiate
- **Mesure**: Délai entre interaction utilisateur et réponse

#### 📐 Cumulative Layout Shift (CLS)
- **Budget**: < 0.1
- **Objectif**: Stabilité visuelle
- **Mesure**: Déplacements inattendus du contenu

### Autres Métriques Importantes

#### 🚀 First Contentful Paint (FCP)
- **Budget**: < 1.8s
- **Mesure**: Premier élément de contenu rendu

#### ⏱️ Time to Interactive (TTI)
- **Budget**: < 3.8s
- **Mesure**: Page entièrement interactive

#### 🔒 Total Blocking Time (TBT)
- **Budget**: < 300ms
- **Mesure**: Temps où le thread principal est bloqué

#### 📈 Speed Index
- **Budget**: < 3.4s
- **Mesure**: Vitesse de rendu visuel du contenu

## 🏃 Lighthouse CI

### Configuration

Le pipeline CI/CD exécute automatiquement Lighthouse sur :
- Page d'accueil (`/`)
- Page templates (`/templates`)
- Page analytics (`/analytics`)

### Scores Minimums Requis

| Catégorie | Score Minimum | Description |
|-----------|---------------|-------------|
| Performance | 90/100 | Vitesse et optimisation |
| Accessibility | 90/100 | Accessibilité WCAG |
| Best Practices | 90/100 | Standards web |
| SEO | 90/100 | Optimisation SEO |

### Exécuter Lighthouse Localement

```bash
# Installer Lighthouse CI
npm install -g @lhci/cli

# Build l'application
npm run build

# Lancer Lighthouse
lhci autorun
```

### Interpréter les Résultats

Les rapports Lighthouse sont disponibles dans :
- GitHub Actions artifacts (`.lighthouseci/`)
- Commentaires automatiques sur les PRs
- Historique de performance (90 jours)

## 🎯 Budgets de Performance

### JavaScript

```json
{
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 300
    },
    {
      "resourceType": "total",
      "budget": 500
    }
  ]
}
```

### Images

```json
{
  "resourceSizes": [
    {
      "resourceType": "image",
      "budget": 200
    }
  ]
}
```

### Fonts

```json
{
  "resourceSizes": [
    {
      "resourceType": "font",
      "budget": 100
    }
  ]
}
```

## 🔧 Optimisations Appliquées

### Code Splitting

- ✅ Routes lazy-loaded avec React.lazy()
- ✅ Composants lourds chargés à la demande
- ✅ Bibliothèques externes en chunks séparés

### Images

- ✅ Format WebP avec fallback
- ✅ Lazy loading natif
- ✅ Responsive images avec srcset
- ✅ Compression optimale

### Fonts

- ✅ Préchargement des fonts critiques
- ✅ Font-display: swap
- ✅ Subsetting des caractères
- ✅ WOFF2 format

### CSS

- ✅ Critical CSS inline
- ✅ CSS minifié et compressé
- ✅ Purge du CSS non utilisé
- ✅ CSS Modules pour scope

### JavaScript

- ✅ Tree shaking
- ✅ Minification
- ✅ Compression Gzip/Brotli
- ✅ Module preload

## 📈 Monitoring Continu

### GitHub Actions

Le workflow Lighthouse CI s'exécute :
- ✅ À chaque push sur main/develop
- ✅ À chaque pull request
- ✅ Manuellement via workflow_dispatch

### Rapports

Les rapports incluent :
- Scores des 4 catégories Lighthouse
- Métriques Core Web Vitals détaillées
- Recommandations d'optimisation
- Comparaisons avec les budgets

### Alertes

Le build échoue si :
- ❌ Score Performance < 90
- ❌ Score Accessibility < 90
- ❌ LCP > 2.5s
- ❌ CLS > 0.1
- ❌ TBT > 300ms

## 🛠️ Outils de Debugging

### Chrome DevTools

```bash
# Ouvrir Performance tab
1. F12 → Performance
2. Record
3. Interagir avec la page
4. Stop
5. Analyser le flame chart
```

### Lighthouse DevTools

```bash
# Ouvrir Lighthouse
1. F12 → Lighthouse
2. Sélectionner catégories
3. Analyze page load
4. Lire les recommandations
```

### React DevTools Profiler

```bash
# Profiler les composants React
1. Installer React DevTools
2. Profiler tab
3. Record
4. Interagir
5. Analyser les re-renders
```

## 🚀 Best Practices

### Code

1. **Éviter les re-renders inutiles**
   ```typescript
   // ✅ Bon
   const MemoComponent = React.memo(Component);
   
   // ✅ Bon
   const value = useMemo(() => computeExpensive(), [dep]);
   
   // ✅ Bon
   const callback = useCallback(() => {}, [dep]);
   ```

2. **Lazy loading**
   ```typescript
   // ✅ Bon
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   
   <Suspense fallback={<Loader />}>
     <HeavyComponent />
   </Suspense>
   ```

3. **Virtualisation pour listes longues**
   ```typescript
   // ✅ Bon
   import { FixedSizeList } from 'react-window';
   
   <FixedSizeList
     height={600}
     itemCount={1000}
     itemSize={50}
   >
     {Row}
   </FixedSizeList>
   ```

### Assets

1. **Optimiser les images**
   ```bash
   # Utiliser des outils comme sharp
   npm install sharp
   sharp input.jpg -o output.webp
   ```

2. **Précharger les ressources critiques**
   ```html
   <link rel="preload" href="/fonts/font.woff2" as="font" type="font/woff2" crossorigin>
   ```

3. **Différer le JavaScript non critique**
   ```html
   <script src="non-critical.js" defer></script>
   ```

## 📊 Rapport de Performance

### Format du Rapport

Chaque run génère :
- Scores JSON détaillés
- Rapport HTML visuel
- Métriques exportées
- Screenshots

### Historique

Les rapports sont conservés :
- **30 jours** : Artifacts GitHub Actions
- **90 jours** : Performance history
- **Permanent** : Commits sur main (via artifacts)

## 🎯 Objectifs 2024

- [ ] Performance score > 95 sur toutes les pages
- [ ] LCP < 2.0s (actuellement < 2.5s)
- [ ] CLS < 0.05 (actuellement < 0.1)
- [ ] Automatisation des optimisations d'images
- [ ] CDN pour assets statiques
- [ ] Service Worker pour cache avancé

## 🔗 Ressources

- [Web.dev - Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Performance Budget Calculator](https://perf-budget-calculator.firebaseapp.com/)
- [Can I Use](https://caniuse.com/)
