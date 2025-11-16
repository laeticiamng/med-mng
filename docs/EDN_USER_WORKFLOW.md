# Workflow Utilisateur EDN - Génération Musicale

## 🎯 Objectif Principal de la Plateforme

**Permettre à chaque utilisateur de générer SA PROPRE chanson personnalisée** pour mémoriser les compétences EDN selon :
- **L'item EDN choisi** (IC-001 à IC-367)
- **Son niveau de connaissance** (Rang A, Rang B, ou Rang A+B)
- **Son style musical préféré** (rap, pop, rock, lo-fi, etc.)

---

## 👤 Parcours Utilisateur Complet

### Étape 1: Sélection de l'Item EDN

L'utilisateur navigue dans la bibliothèque des 367 items EDN et en choisit un.

**Interface:**
```
┌─────────────────────────────────────┐
│  Catalogue EDN (367 items)          │
│                                     │
│  🔍 Recherche: [____________]       │
│                                     │
│  📚 IC-001: Relations entre professionnel...│
│  📚 IC-002: Valeurs professionnelles...│
│  📚 IC-003: ...                     │
│                                     │
│  [Sélectionner un item]             │
└─────────────────────────────────────┘
```

**Exemple:** Utilisateur clique sur **IC-001**

---

### Étape 2: Choix du Niveau de Connaissance

Une fois l'item sélectionné, l'utilisateur choisit son niveau :

**Interface:**
```
┌─────────────────────────────────────┐
│  IC-001: Relations entre profess...│
│                                     │
│  Choisissez votre niveau:           │
│                                     │
│  🟢 Rang A (Fondamental)            │
│     └─ 8 compétences de base        │
│     └─ Paroles: 12 lignes           │
│                                     │
│  🔵 Rang B (Avancé)                 │
│     └─ 5 compétences avancées       │
│     └─ Paroles: 10 lignes           │
│                                     │
│  🟣 Rang A+B (Complet)              │
│     └─ 13 compétences totales       │
│     └─ Paroles: 18 lignes           │
│                                     │
└─────────────────────────────────────┘
```

**Exemple:** Utilisateur choisit **Rang A**

---

### Étape 3: Choix du Style Musical

L'utilisateur personnalise le style de sa chanson :

**Interface:**
```
┌─────────────────────────────────────┐
│  Générateur Musical Suno            │
│                                     │
│  🎵 Style musical:                  │
│                                     │
│  [✓] Rap éducatif (style Nekfeu)   │
│  [ ] Pop énergique                  │
│  [ ] Rock mémorable                 │
│  [ ] Lo-fi studieux                 │
│  [ ] R&B smooth                     │
│  [ ] Électro motivant               │
│  [ ] Jazz relaxant                  │
│  [ ] Personnalisé: [___________]    │
│                                     │
│  Tempo: [●─────────] Moyen          │
│  Voix: [Homme ▼]                    │
│                                     │
│  [🎵 Générer ma chanson]            │
└─────────────────────────────────────┘
```

**Exemple:** Utilisateur choisit **Rap éducatif**

---

### Étape 4: Génération de la Chanson

Le système génère une chanson unique pour cet utilisateur :

**Processus Backend:**

```typescript
// 1. Récupérer les paroles fixes pour l'item + rang
const { data: item } = await supabase
  .from('edn_items_complete')
  .select('item_code, paroles_rang_a, title')
  .eq('item_code', 'IC-001')
  .single();

const paroles = item.paroles_rang_a; // Array de lignes

// 2. Appeler l'API Suno avec les paramètres choisis
const sunoResponse = await fetch('https://api.suno.ai/v1/generate', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${SUNO_API_KEY}` },
  body: JSON.stringify({
    lyrics: paroles.join('\n'),
    style: 'educational rap',
    title: `${item.title} - Rang A`,
    tempo: 'medium',
    voice: 'male'
  })
});

const { audio_id, status } = await sunoResponse.json();

// 3. Enregistrer la chanson générée
const { data: song } = await supabase
  .from('med_mng_songs')
  .insert({
    title: `${item.title} - Rang A`,
    suno_audio_id: audio_id,
    item_code: 'IC-001',
    rang_type: 'A',
    is_static: false,  // ✨ Générée par utilisateur
    music_style: 'rap éducatif',
    generation_source: 'suno',
    lyrics: { text: paroles },
    meta: {
      user_id: userId,
      tempo: 'medium',
      voice: 'male',
      generated_at: new Date()
    }
  })
  .select()
  .single();

// 4. Ajouter à la bibliothèque de l'utilisateur
await supabase
  .from('med_mng_user_songs')
  .insert({
    user_id: userId,
    song_id: song.id,
    is_favorite: false
  });

return song;
```

**Interface Pendant Génération:**
```
┌─────────────────────────────────────┐
│  🎵 Génération en cours...          │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🎼 Création de votre chanson  │ │
│  │    personnalisée...            │ │
│  │                                │ │
│  │ [████████░░░░░░░░] 60%         │ │
│  │                                │ │
│  │ Estimation: 15 secondes        │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### Étape 5: Écoute et Mémorisation

La chanson générée est prête à être écoutée :

**Interface:**
```
┌─────────────────────────────────────┐
│  ✅ Chanson Générée !               │
│                                     │
│  🎵 IC-001 - Rang A                 │
│      Style: Rap éducatif            │
│      Durée: 2:34                    │
│                                     │
│  [▶️ Play] [⏸️ Pause] [🔁 Loop]     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🎤 Paroles                    │ │
│  │                               │ │
│  │ [Couplet 1]                   │ │
│  │ Analyser, communiquer, agir   │ │
│  │ C'est le cœur de l'éthique    │ │
│  │ ...                           │ │
│  │                               │ │
│  │ [Refrain]                     │ │
│  │ Rang A, les fondamentaux...   │ │
│  │ ...                           │ │
│  └───────────────────────────────┘ │
│                                     │
│  [⭐ Ajouter aux favoris]           │
│  [📥 Télécharger]                   │
│  [🔄 Générer une autre version]     │
└─────────────────────────────────────┘
```

---

## 🔄 Scénarios Avancés

### Régénération avec Nouveau Style

L'utilisateur peut générer **plusieurs versions** du même item+rang avec différents styles :

**Exemple:**
- Version 1: IC-001 + Rang A + **Rap** → Chanson A
- Version 2: IC-001 + Rang A + **Pop** → Chanson B
- Version 3: IC-001 + Rang A + **Lo-fi** → Chanson C

Toutes sont sauvegardées dans la bibliothèque de l'utilisateur.

```sql
-- Requête pour voir les versions générées
SELECT
  title,
  music_style,
  created_at
FROM med_mng_songs s
JOIN med_mng_user_songs us ON s.id = us.song_id
WHERE us.user_id = 'user-123'
  AND s.item_code = 'IC-001'
  AND s.rang_type = 'A'
ORDER BY created_at DESC;

-- Résultat:
-- IC-001 - Rang A | Lo-fi studieux   | 2025-11-16 15:30
-- IC-001 - Rang A | Pop énergique    | 2025-11-16 14:20
-- IC-001 - Rang A | Rap éducatif     | 2025-11-16 10:15
```

### Chanson Officielle vs Personnalisée

**Chansons Officielles** (`is_static = true`):
- Créées par l'équipe pédagogique
- Une seule version par item+rang
- Disponible pour tous les utilisateurs
- Recommandée par défaut

**Chansons Personnalisées** (`is_static = false`):
- Générées par chaque utilisateur
- Multiples versions possibles
- Stockées dans la bibliothèque personnelle
- Style et paramètres choisis par l'utilisateur

**Interface avec Choix:**
```
┌─────────────────────────────────────┐
│  IC-001 - Rang A                    │
│                                     │
│  🎵 Version Officielle              │
│     Style: Rap éducatif (Nekfeu)    │
│     [▶️ Écouter]                    │
│                                     │
│  ──────────────────────────────────  │
│                                     │
│  💡 Vous préférez un autre style ?  │
│     [🎵 Générer ma version]         │
│                                     │
│  📚 Mes versions générées (2):      │
│     • Pop énergique [▶️]            │
│     • Lo-fi studieux [▶️]           │
└─────────────────────────────────────┘
```

---

## 📊 Modèle de Données

### Structure de `med_mng_songs`

```sql
CREATE TABLE med_mng_songs (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  suno_audio_id TEXT NOT NULL UNIQUE,

  -- ✨ Nouvelles colonnes (migration 20251116220000)
  item_code TEXT,                    -- IC-001, IC-002, etc.
  rang_type TEXT,                    -- 'A', 'B', 'AB'
  is_static BOOLEAN DEFAULT false,   -- false = générée par user
  music_style TEXT,                  -- 'rap', 'pop', 'lo-fi', etc.
  generation_source TEXT DEFAULT 'suno',

  -- Métadonnées
  meta JSONB DEFAULT '{}',
  lyrics JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Structure de `med_mng_user_songs` (Bibliothèque)

```sql
CREATE TABLE med_mng_user_songs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  song_id UUID REFERENCES med_mng_songs(id),
  is_favorite BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Exemples de Requêtes

**1. Chanson officielle pour un item+rang:**
```sql
SELECT * FROM med_mng_songs
WHERE item_code = 'IC-001'
  AND rang_type = 'A'
  AND is_static = true
LIMIT 1;
```

**2. Toutes les versions générées par un utilisateur:**
```sql
SELECT s.*
FROM med_mng_songs s
JOIN med_mng_user_songs us ON s.id = us.song_id
WHERE us.user_id = $1
  AND s.item_code = 'IC-001'
  AND s.rang_type = 'A'
  AND s.is_static = false
ORDER BY s.created_at DESC;
```

**3. Statistiques de génération par style:**
```sql
SELECT
  music_style,
  COUNT(*) as total_generated,
  COUNT(DISTINCT item_code) as items_covered
FROM med_mng_songs
WHERE is_static = false
GROUP BY music_style
ORDER BY total_generated DESC;

-- Résultat:
-- rap éducatif    | 1,234 | 187
-- pop énergique   | 892   | 145
-- lo-fi studieux  | 678   | 123
-- ...
```

---

## 🎯 Objectifs de Complétude Révisés

### Ce qui est REQUIS (100%)

1. **✅ Paroles Fixes Séparées par Rang** (367 items)
   - `paroles_rang_a[]` pour tous les items
   - `paroles_rang_b[]` pour tous les items
   - `paroles_rang_ab[]` pour tous les items
   - **Statut:** À générer ou récupérer

2. **✅ Compétences OIC Complètes** (367 items)
   - Rang A complet pour tous
   - Rang B complet pour tous
   - **Statut:** ~60-70% déjà fait

3. **✅ Quiz Interactifs** (367 items)
   - Minimum 3-5 questions par item
   - **Statut:** ~60-70% déjà fait

### Ce qui est OPTIONNEL

4. **🔄 Chansons Officielles** (367 × 3 = 1,101)
   - Une chanson officielle par item+rang
   - `is_static = true`
   - **Statut:** Optionnel, peut être généré progressivement
   - **Alternative:** Laisser les utilisateurs générer leurs propres versions

5. **🔄 Bandes Dessinées Fixes** (367+)
   - Une BD fixe par item
   - **Statut:** Peut être différé ou généré progressivement

---

## 💡 Recommandations d'Implémentation

### Phase 1: Essentiel (Semaine 1)

1. ✅ Appliquer la migration base de données
2. ✅ Générer les paroles fixes séparées (A, B, AB)
3. ✅ Compléter les compétences OIC manquantes
4. ✅ Compléter les quiz manquants

### Phase 2: Générateur (Semaine 2)

1. Créer l'interface de sélection item → rang → style
2. Intégrer l'API Suno avec les bons paramètres
3. Gérer le flux de génération asynchrone
4. Sauvegarder les chansons générées dans `med_mng_songs`
5. Ajouter à la bibliothèque utilisateur via `med_mng_user_songs`

### Phase 3: Optimisations (Semaine 3)

1. Créer quelques chansons officielles (10-20 items)
2. Ajouter suggestions de styles populaires
3. Permettre partage de chansons entre utilisateurs
4. Analytics sur les styles préférés

### Phase 4: Bonus (Semaine 4+)

1. Bandes dessinées fixes progressivement
2. Mode karaoke avec paroles synchronisées
3. Playlists thématiques
4. Système de notation/reviews

---

## 📈 Métriques de Succès

### Côté Plateforme

- ✅ 367/367 items avec paroles A, B, AB
- ✅ 367/367 items avec compétences OIC complètes
- ✅ 367/367 items avec quiz fonctionnel
- 🔄 X chansons officielles créées (optionnel)

### Côté Utilisateur

- Nombre de chansons générées par utilisateur
- Styles musicaux les plus populaires
- Taux de régénération (plusieurs versions)
- Temps d'écoute moyen par chanson
- Items EDN les plus travaillés

---

**Conclusion:**

Le système permet à chaque utilisateur de créer **SA** chanson personnalisée pour mémoriser les EDN, avec le style musical de **SON** choix. C'est l'objectif principal et la valeur ajoutée unique de la plateforme !

---

**Dernière mise à jour:** 2025-11-16
**Document:** Workflow Utilisateur EDN
