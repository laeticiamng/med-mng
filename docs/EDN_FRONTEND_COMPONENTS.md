# Composants Frontend EDN - Documentation

Documentation complète des nouveaux composants React et hooks pour le système EDN enrichi.

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Hooks React Query](#hooks-react-query)
3. [Composants UI](#composants-ui)
4. [Utilisation](#utilisation)
5. [Exemples](#exemples)
6. [Configuration Routes](#configuration-routes)

---

## Vue d'Ensemble

### Nouveaux Fichiers Créés

```
src/
├── hooks/
│   ├── useEdnQuality.ts          (7 hooks pour qualité et stats)
│   └── useEdnSearch.ts            (7 hooks pour recherche et filtres)
├── pages/
│   └── EdnQualityDashboard.tsx    (Dashboard complet de qualité)
├── components/edn/
│   ├── EdnAdvancedSearch.tsx      (Recherche avancée avec filtres)
│   ├── EdnQualityAnalysis.tsx     (Analyse détaillée d'un item)
│   └── EdnSimilarItems.tsx        (Recommandations d'items similaires)
└── config/
    └── routes.ts                   (Route ajoutée: /edn/quality-dashboard)
```

**Total** : 14 nouveaux hooks + 4 nouveaux composants

---

## Hooks React Query

### Fichier: `src/hooks/useEdnQuality.ts`

#### 1. `useEdnItemQuality(itemCode, options?)`

Analyse la qualité d'un item EDN spécifique.

**Paramètres** :
- `itemCode` : Code de l'item (ex: "IC-1")
- `options` : Options React Query

**Retour** : `EdnQualityReport`
```typescript
{
  item_code: "IC-1",
  title: "La relation médecin-malade",
  quality_score: 85,
  quality_grade: "Très bon",
  completeness_percentage: 85,
  quality_details: [...],
  missing_elements: [...],
  suggestions: [...],
  competences_count: {
    rang_a: 12,
    rang_b: 8,
    total: 20
  },
  is_validated: true,
  analyzed_at: "2025-11-14T..."
}
```

**Exemple** :
```tsx
const { data: quality, isLoading } = useEdnItemQuality('IC-1');

console.log(quality.quality_score); // 85
console.log(quality.quality_grade); // "Très bon"
```

---

#### 2. `useEdnGlobalQuality(options?)`

Rapport global de qualité de tous les items EDN.

**Retour** : `EdnQualityGlobalReport`
```typescript
{
  total_items: 367,
  average_quality_score: 72.5,
  quality_distribution: {
    excellent: 45,
    tres_bon: 89,
    bon: 120,
    satisfaisant: 67,
    moyen: 32,
    insuffisant: 14
  },
  items_with_all_components: 45,
  items_validated: 134,
  last_refresh: "2025-11-14T..."
}
```

**Exemple** :
```tsx
const { data: globalReport } = useEdnGlobalQuality();

console.log(globalReport.total_items); // 367
console.log(globalReport.quality_distribution.excellent); // 45
```

---

#### 3. `useEnrichEdnItem()` (Mutation)

Enrichit un item EDN spécifique (extraction mots-clés, tags, etc.).

**Retour** : `EdnEnrichmentResult`

**Exemple** :
```tsx
const enrichItem = useEnrichEdnItem();

await enrichItem.mutateAsync('IC-1');
// Résultat :
// {
//   item_code: "IC-1",
//   enriched: true,
//   extracted_keywords_count: 15,
//   inferred_complexity: "intermediaire",
//   medical_tags_count: 5,
//   timestamp: "2025-11-14T..."
// }
```

---

#### 4. `useEnrichAllEdnItems()` (Mutation)

Enrichit tous les items EDN en masse (⚠️ opération lourde).

**Exemple** :
```tsx
const enrichAll = useEnrichAllEdnItems();

await enrichAll.mutateAsync();
// {
//   total_processed: 367,
//   total_enriched: 365,
//   success_rate: 99.45
// }
```

---

#### 5. `useEdnGlobalStats(options?)`

Statistiques globales depuis la vue matérialisée `edn_global_stats`.

**Retour** :
```typescript
{
  total_items: 367,
  complete_items: 250,
  incomplete_items: 117,
  validated_items: 200,
  avg_completeness: 75.5,
  avg_competences_per_item: 12.3,
  total_competences_rang_a: 2700,
  total_competences_rang_b: 2100,
  items_with_tableau_a: 300,
  items_with_tableau_b: 300,
  items_with_music: 150,
  items_with_immersive: 30,
  items_with_quiz: 100,
  last_update: "2025-11-14T..."
}
```

---

#### 6. `useEdnStatsBySpecialite(options?)`

Statistiques par spécialité médicale.

**Exemple** :
```tsx
const { data: specialtyStats } = useEdnStatsBySpecialite();

specialtyStats.forEach(spec => {
  console.log(
    spec.specialite,
    spec.item_count,
    spec.avg_completeness
  );
});
```

---

#### 7. `useRefreshEdnViews()` (Mutation)

Rafraîchit manuellement les vues matérialisées (nécessite privilèges admin).

---

### Fichier: `src/hooks/useEdnSearch.ts`

#### 1. `useEdnSearch(searchTerm, options?)`

Recherche full-text avec ranking de pertinence.

**Paramètres** :
- `searchTerm` : Terme de recherche (min 2 caractères)
- `options.limit` : Nombre de résultats (défaut: 20)
- `options.offset` : Pagination

**Retour** : `EdnSearchResult[]`

**Exemple** :
```tsx
const { data: results } = useEdnSearch('cardiologie', { limit: 10 });

results.forEach(item => {
  console.log(
    item.item_code,
    item.title,
    item.rank // Score de pertinence 0-1
  );
});
```

---

#### 2. `useEdnSimilarItems(itemCode, options?)`

Items similaires à un item donné (basé sur spécialité + tags).

**Exemple** :
```tsx
const { data: similar } = useEdnSimilarItems('IC-1', { limit: 5 });

similar.forEach(item => {
  console.log(
    item.item_code,
    item.similarity_score, // 0-1
    item.shared_tags // Nombre de tags partagés
  );
});
```

---

#### 3. `useEdnItemsBySpecialite(specialite, options?)`

Filtrer items par spécialité.

---

#### 4. `useEdnItemsByComplexite(niveau, options?)`

Filtrer items par niveau de complexité ('debutant' | 'intermediaire' | 'avance' | 'expert').

---

#### 5. `useEdnIncompleteItems(threshold, options?)`

Items incomplets (score < threshold).

**Exemple** :
```tsx
const { data: incomplete } = useEdnIncompleteItems(60, { limit: 10 });
// Retourne les 10 items avec score < 60%
```

---

#### 6. `useEdnTopItems(limit, options?)`

Top items avec meilleurs scores.

---

#### 7. `useEdnAdvancedSearch(params)`

Recherche avancée avec filtres multiples.

**Paramètres** :
```typescript
{
  searchTerm?: string;
  specialite?: string;
  minScore?: number;
  maxScore?: number;
  validated?: boolean;
  limit?: number;
  offset?: number;
}
```

**Exemple** :
```tsx
const { data } = useEdnAdvancedSearch({
  searchTerm: 'cœur',
  specialite: 'Cardiologie',
  minScore: 70,
  validated: true,
  limit: 20
});
```

---

## Composants UI

### 1. EdnQualityDashboard

**Fichier** : `src/pages/EdnQualityDashboard.tsx`

Dashboard complet de qualité pour tous les items EDN.

**Fonctionnalités** :
- Statistiques globales (4 cards)
- Distribution par grade de qualité
- Statistiques par spécialité
- Top 10 meilleurs items
- Top 10 items à améliorer
- Bouton d'enrichissement en masse

**Onglets** :
1. **Vue d'ensemble** - Stats globales + disponibilité contenu
2. **Distribution** - Graphiques par grade (Excellent, Très bon, etc.)
3. **Par Spécialité** - Performance par domaine médical
4. **Top Items** - Meilleurs scores
5. **À Améliorer** - Items incomplets

**Route** : `/edn/quality-dashboard`

**Utilisation** :
```tsx
import EdnQualityDashboard from '@/pages/EdnQualityDashboard';

// Dans votre router
<Route path="/edn/quality-dashboard" element={<EdnQualityDashboard />} />
```

---

### 2. EdnAdvancedSearch

**Fichier** : `src/components/edn/EdnAdvancedSearch.tsx`

Composant de recherche avancée avec filtres.

**Fonctionnalités** :
- Barre de recherche avec debounce (300ms)
- Filtres avancés (spécialité, score min/max, validation)
- Affichage du nombre de filtres actifs
- Résultats avec ranking de pertinence
- Support pagination

**Filtres** :
- Terme de recherche
- Spécialité médicale (dropdown)
- Score de complétude (min/max avec sliders)
- Items validés uniquement (switch)

**Utilisation** :
```tsx
import EdnAdvancedSearch from '@/components/edn/EdnAdvancedSearch';

<EdnAdvancedSearch />
```

---

### 3. EdnQualityAnalysis

**Fichier** : `src/components/edn/EdnQualityAnalysis.tsx`

Analyse détaillée de la qualité d'un item EDN.

**Affichage** :
- Score global avec grade (Excellent, Très bon, etc.)
- Étoiles (⭐⭐⭐⭐⭐)
- Statut de validation
- Compteurs de compétences (Rang A, B, Total)
- Détail par composant (tableau, quiz, etc.)
- Liste des éléments manquants
- Suggestions d'amélioration numérotées
- Bouton d'enrichissement

**Utilisation** :
```tsx
import EdnQualityAnalysis from '@/components/edn/EdnQualityAnalysis';

<EdnQualityAnalysis itemCode="IC-1" />
```

---

### 4. EdnSimilarItems

**Fichier** : `src/components/edn/EdnSimilarItems.tsx`

Recommandations d'items similaires.

**Affichage** :
- Liste d'items similaires
- Score de similarité (0-100%)
- Barre de progression
- Nombre de tags partagés
- Click → navigation vers l'item

**Utilisation** :
```tsx
import EdnSimilarItems from '@/components/edn/EdnSimilarItems';

<EdnSimilarItems itemCode="IC-1" limit={5} />
```

---

## Utilisation

### Scénario 1 : Afficher la Qualité d'un Item

```tsx
import { useEdnItemQuality } from '@/hooks/useEdnQuality';
import EdnQualityAnalysis from '@/components/edn/EdnQualityAnalysis';

function ItemDetailPage({ itemCode }: { itemCode: string }) {
  return (
    <div>
      <EdnQualityAnalysis itemCode={itemCode} />
    </div>
  );
}
```

---

### Scénario 2 : Recherche Avancée

```tsx
import EdnAdvancedSearch from '@/components/edn/EdnAdvancedSearch';

function SearchPage() {
  return (
    <div className="container mx-auto py-8">
      <h1>Rechercher un Item EDN</h1>
      <EdnAdvancedSearch />
    </div>
  );
}
```

---

### Scénario 3 : Dashboard Complet

```tsx
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <Link to="/edn/quality-dashboard">
        Voir le Dashboard de Qualité
      </Link>
    </div>
  );
}
```

---

### Scénario 4 : Enrichissement d'Items

```tsx
import { useEnrichEdnItem } from '@/hooks/useEdnQuality';
import { toast } from '@/hooks/use-toast';

function EnrichButton({ itemCode }: { itemCode: string }) {
  const enrichItem = useEnrichEdnItem();

  const handleEnrich = async () => {
    try {
      const result = await enrichItem.mutateAsync(itemCode);
      toast({
        title: 'Item enrichi !',
        description: `${result.extracted_keywords_count} mots-clés extraits`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <button onClick={handleEnrich}>
      Enrichir l'Item
    </button>
  );
}
```

---

## Exemples

### Exemple Complet : Page de Détail d'Item

```tsx
import { useParams } from 'react-router-dom';
import EdnQualityAnalysis from '@/components/edn/EdnQualityAnalysis';
import EdnSimilarItems from '@/components/edn/EdnSimilarItems';

export default function EdnItemDetailPage() {
  const { itemCode } = useParams<{ itemCode: string }>();

  if (!itemCode) {
    return <div>Item non trouvé</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Analyse de qualité */}
      <EdnQualityAnalysis itemCode={itemCode} />

      {/* Items similaires */}
      <EdnSimilarItems itemCode={itemCode} limit={5} />
    </div>
  );
}
```

---

### Exemple : Widget de Statistiques Globales

```tsx
import { useEdnGlobalStats } from '@/hooks/useEdnQuality';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EdnStatsWidget() {
  const { data: stats } = useEdnGlobalStats();

  if (!stats) return null;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.total_items}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complétude Moyenne</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {stats.avg_completeness.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items Validés</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.validated_items}</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Configuration Routes

### Route Ajoutée

**Fichier** : `src/config/routes.ts`

```typescript
export const ROUTE_PATHS = {
  // ... autres routes
  ednQualityDashboard: '/edn/quality-dashboard',
  // ...
};
```

### Intégration dans le Router

```tsx
import { lazy } from 'react';
import { ROUTE_PATHS } from '@/config/routes';

const EdnQualityDashboard = lazy(() => import('@/pages/EdnQualityDashboard'));

// Dans votre router
<Route
  path={ROUTE_PATHS.ednQualityDashboard}
  element={<EdnQualityDashboard />}
/>
```

---

## Prérequis

### Migration SQL Appliquée

Tous ces composants nécessitent que la migration SQL ait été appliquée :

```bash
# Via Supabase CLI
supabase db push

# OU via script
./scripts/apply-edn-enrichment.sh
```

### Fonctions SQL Disponibles

Les fonctions SQL suivantes doivent exister :
- `analyze_edn_item_quality(item_code)`
- `get_edn_quality_global_report()`
- `enrich_edn_item_metadata(item_code)`
- `enrich_all_edn_items()`
- `search_edn_items(search_term, limit, offset)`
- `get_similar_edn_items(item_code, limit)`

### Vues Matérialisées

Les vues suivantes doivent exister :
- `edn_global_stats`
- `edn_stats_by_specialite`

---

## Performance

### Optimisations Implémentées

1. **Debounce** sur la recherche (300ms)
2. **Stale Time** approprié pour chaque hook :
   - Statistiques globales : 15 minutes
   - Recherche : 5 minutes
   - Analyse qualité : 15 minutes

3. **React Query Cache** :
   - Invalidation automatique après mutations
   - Refetch stratégique

4. **Lazy Loading** des composants
5. **Pagination** sur les résultats de recherche

---

## Troubleshooting

### Erreur : "fonction n'existe pas"

**Solution** : Vérifier que la migration SQL a été appliquée
```sql
SELECT * FROM pg_proc WHERE proname LIKE '%edn%';
```

### Erreur : "table n'existe pas"

**Solution** : Vérifier les vues matérialisées
```sql
SELECT * FROM pg_matviews WHERE matviewname LIKE 'edn%';
```

### Pas de résultats de recherche

**Solution** : Vérifier les index trigram
```sql
SELECT * FROM pg_indexes WHERE tablename = 'edn_items_complete';
```

---

## Documentation Complète

Pour plus de détails, consultez :
- **[Analyse EDN Complète](./ANALYSE_EDN_COMPLETE_2025-11-14.md)** - Architecture (800+ lignes)
- **[Guide d'Application](./GUIDE_APPLICATION_ENRICHISSEMENT_EDN.md)** - Instructions
- **[README EDN](./README-EDN.md)** - Point d'entrée

---

**Documentation Frontend EDN - MED-MNG**
**Dernière mise à jour : 2025-11-14**
