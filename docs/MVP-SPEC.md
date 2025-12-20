# Med-MNG MVP Specification

> Lead Produit & Architecture - Version 1.0
> Sprint 1 & 2 Planning

---

## 1. Structure Fonctionnelle MVP (5 pages)

### Architecture de Navigation

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Med-MNG    [Search]    [Favoris ❤️] [Profil 👤]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Bibliothèque│ │Playlists │ │Progression│ │ Favoris  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Content Area                       │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🎵 Player Audio (sticky bottom)                     │   │
│  │  [⏮️] [▶️/⏸️] [⏭️]  ═══════○═══  2:34 / 4:12  [🔊]   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Page 1: Bibliothèque (Hub Principal)

**Route:** `/med-mng/library`

**Fonctionnalités:**
- Barre de recherche globale (titre, item_code, spécialité)
- Filtres actifs:
  - Type: EDN / ECOS / SD (Situations Départ)
  - Spécialité: Cardiologie, Pneumologie, etc.
  - Rang: A / B / Mix
  - Statut: Non révisé / En cours / Révisé
- Vue grille ou liste (toggle)
- Tri: Récent, Alphabétique, % progression, Popularité
- Carte item: titre, code, spécialité, badge rang, icône audio, statut révision

**Wireframe:**
```
┌────────────────────────────────────────────────────────────┐
│ 🔍 Rechercher un item, une spécialité...                   │
├────────────────────────────────────────────────────────────┤
│ [EDN ▼] [Spécialité ▼] [Rang ▼] [Statut ▼]    [≡ Grille]  │
├────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ 📘 Item 157  │ │ 📘 Item 234  │ │ 📘 Item 312  │        │
│ │ Cardiologie  │ │ Pneumologie  │ │ Neurologie   │        │
│ │ ━━━━━━━━     │ │ ▓▓▓▓▓▓▓▓▓▓   │ │ ░░░░░░░░░░   │        │
│ │ 60% révisé   │ │ ✅ Révisé    │ │ Non commencé │        │
│ │ [🎵] [❤️]    │ │ [🎵] [❤️]    │ │ [🎵] [🤍]    │        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
└────────────────────────────────────────────────────────────┘
```

---

### Page 2: Détail Item (Fiche + Audio)

**Route:** `/med-mng/items/:itemCode`

**Fonctionnalités:**
- Header: titre, code, spécialité, rang, tags
- Section Fiche: tableaux responsives avec sections collapsibles
- Section Audio: player inline avec sélection rang A/B/Mix
- Actions: Marquer révisé, Ajouter favoris, Ajouter playlist
- Navigation: Item précédent/suivant

**Wireframe:**
```
┌────────────────────────────────────────────────────────────┐
│ ← Retour                              [❤️] [📁+] [✅ Révisé]│
├────────────────────────────────────────────────────────────┤
│ Item 157 - Insuffisance cardiaque                          │
│ 🏷️ Cardiologie • Rang A/B • EDN                            │
├────────────────────────────────────────────────────────────┤
│ ┌─ 🎵 Audio Éducatif ────────────────────────────────────┐ │
│ │  [Rang A ▼]                                            │ │
│ │  [⏮️] [▶️] [⏭️]  ═══════○════════  1:23 / 3:45        │ │
│ │  Style: Rap FR • 120 BPM                               │ │
│ └────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│ ▼ Définition                                               │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Syndrome clinique caractérisé par...                 │   │
│ └──────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│ ▼ Étiologies (Tableau)                                     │
│ ┌────────────────┬─────────────────┬──────────────────┐   │
│ │ Cause          │ Mécanisme       │ Fréquence        │   │
│ ├────────────────┼─────────────────┼──────────────────┤   │
│ │ Cardiopathie   │ Dilatation VG   │ +++              │   │
│ │ ischémique     │                 │                  │   │
│ ├────────────────┼─────────────────┼──────────────────┤   │
│ │ HTA            │ Hypertrophie    │ ++               │   │
│ └────────────────┴─────────────────┴──────────────────┘   │
├────────────────────────────────────────────────────────────┤
│ ▼ Diagnostic                                               │
│ ▼ Traitement                                               │
│ ▼ Surveillance                                             │
└────────────────────────────────────────────────────────────┘
```

---

### Page 3: Playlists

**Route:** `/med-mng/playlists` et `/med-mng/playlists/:id`

**Fonctionnalités:**
- Liste playlists utilisateur
- Création rapide playlist
- Playlists suggérées (par spécialité, par difficulté)
- Détail playlist: drag-drop réordonnancement, lecture continue
- Mode révision: lecture séquentielle avec pause entre items

**Wireframe:**
```
┌────────────────────────────────────────────────────────────┐
│ Mes Playlists                            [+ Nouvelle]      │
├────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 📁 Cardio - Révisions ECN           12 items • 45min │   │
│ │    Dernière écoute: il y a 2 jours        [▶️ Jouer] │   │
│ └──────────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 📁 Items difficiles                   8 items • 32min│   │
│ │    Créée: 15/12/2024                      [▶️ Jouer] │   │
│ └──────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│ 💡 Playlists Suggérées                                     │
│ ┌──────────────────┐ ┌──────────────────┐                  │
│ │ 🔥 Top Pneumo    │ │ ⭐ Essentiels    │                  │
│ │ 15 items         │ │ EDN             │                  │
│ └──────────────────┘ └──────────────────┘                  │
└────────────────────────────────────────────────────────────┘
```

---

### Page 4: Favoris

**Route:** `/med-mng/favorites`

**Fonctionnalités:**
- Liste items favoris avec filtres rapides
- Vue compacte ou détaillée
- Actions groupées (ajouter à playlist, marquer révisé)
- Export liste favoris

**Wireframe:**
```
┌────────────────────────────────────────────────────────────┐
│ ❤️ Mes Favoris (24 items)                                  │
├────────────────────────────────────────────────────────────┤
│ [Tous] [À réviser: 8] [Révisés: 16]     [Ajouter à 📁]    │
├────────────────────────────────────────────────────────────┤
│ ☑️ Item 157 - Insuffisance cardiaque    ✅ Révisé   [🗑️]  │
│ ☑️ Item 234 - Pneumothorax              ⏳ En cours [🗑️]  │
│ ☐ Item 312 - AVC ischémique             📝 À faire  [🗑️]  │
│ ...                                                        │
└────────────────────────────────────────────────────────────┘
```

---

### Page 5: Progression

**Route:** `/med-mng/progress`

**Fonctionnalités:**
- Dashboard progression globale
- Streak de révision (jours consécutifs)
- Stats par spécialité (% complété)
- Historique récent
- Objectifs hebdomadaires

**Wireframe:**
```
┌────────────────────────────────────────────────────────────┐
│ 📊 Ma Progression                                          │
├────────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐ ┌──────────────────────────────┐ │
│ │ 🔥 Streak: 7 jours   │ │ Cette semaine: 12/20 items  │ │
│ │ Record: 15 jours     │ │ ████████████░░░░░░░░ 60%    │ │
│ └──────────────────────┘ └──────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│ Progression par Spécialité                                 │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Cardiologie    ████████████████████░░░░  80%  32/40   ││
│ │ Pneumologie    ████████████░░░░░░░░░░░░  50%  18/36   ││
│ │ Neurologie     ████████░░░░░░░░░░░░░░░░  35%  14/40   ││
│ │ Infectiologie  ████░░░░░░░░░░░░░░░░░░░░  15%   6/40   ││
│ └────────────────────────────────────────────────────────┘│
├────────────────────────────────────────────────────────────┤
│ 📅 Activité Récente                                        │
│ • Aujourd'hui: Item 157, Item 234 révisés                  │
│ • Hier: Item 312, Item 156 révisés                         │
│ • 18/12: 5 items révisés                                   │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Modèle de Données Supabase

### Schéma Relationnel

```
┌─────────────────┐       ┌─────────────────┐
│    profiles     │       │   specialties   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ email           │       │ name            │
│ name            │       │ code            │
│ avatar_url      │       │ color           │
│ streak_current  │       │ icon            │
│ streak_best     │       └─────────────────┘
│ last_active     │               │
│ preferences     │               │
└────────┬────────┘               │
         │                        │
         │    ┌───────────────────┤
         │    │                   │
         ▼    ▼                   ▼
┌─────────────────┐       ┌─────────────────┐
│  user_progress  │       │     items       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ id (PK)         │
│ user_id (FK)    │       │ code            │
│ item_id (FK)    │       │ title           │
│ status          │       │ type            │
│ last_seen_at    │       │ specialty_id    │
│ revision_count  │       │ rang            │
│ score           │       │ description     │
│ time_spent      │       └────────┬────────┘
└─────────────────┘                │
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   item_tags     │       │     fiches      │       │     audios      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ item_id (FK)    │       │ id (PK)         │       │ id (PK)         │
│ tag_id (FK)     │       │ item_id (FK)    │       │ item_id (FK)    │
└─────────────────┘       │ title           │       │ rang            │
         │                │ content         │       │ url             │
         ▼                │ type            │       │ stream_url      │
┌─────────────────┐       │ position        │       │ duration        │
│      tags       │       │ source_id       │       │ bpm             │
├─────────────────┤       └─────────────────┘       │ style           │
│ id (PK)         │               │                │ suno_id         │
│ name            │               ▼                │ lyrics          │
│ category        │       ┌─────────────────┐       └─────────────────┘
└─────────────────┘       │    sources      │
                          ├─────────────────┤
                          │ id (PK)         │
                          │ name            │
                          │ url             │
                          │ type            │
                          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│   playlists     │       │ playlist_items  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ id (PK)         │
│ user_id (FK)    │       │ playlist_id (FK)│
│ name            │       │ item_id (FK)    │
│ description     │       │ audio_id (FK)   │
│ is_public       │       │ position        │
│ item_count      │       │ added_at        │
│ total_duration  │       └─────────────────┘
└─────────────────┘

┌─────────────────┐
│    favorites    │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ item_id (FK)    │
│ created_at      │
└─────────────────┘
```

### Scripts SQL Migration

```sql
-- ============================================
-- SPECIALTIES (Spécialités médicales)
-- ============================================
CREATE TABLE specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- 'cardio', 'pneumo', 'neuro'
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'stethoscope',
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ITEMS (EDN/ECOS/Situations de Départ)
-- ============================================
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- 'EDN-157', 'ECOS-12', 'SD-45'
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('EDN', 'ECOS', 'SD')),
  specialty_id UUID REFERENCES specialties(id),
  rang TEXT CHECK (rang IN ('A', 'B', 'AB')),
  description TEXT,
  objectives JSONB DEFAULT '[]', -- Objectifs pédagogiques
  keywords TEXT[], -- Mots-clés pour recherche
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_items_code ON items(code);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_specialty ON items(specialty_id);
CREATE INDEX idx_items_keywords ON items USING GIN(keywords);

-- ============================================
-- TAGS
-- ============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT, -- 'theme', 'pathology', 'symptom'
  color TEXT DEFAULT '#6B7280'
);

CREATE TABLE item_tags (
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

-- ============================================
-- SOURCES (Références bibliographiques)
-- ============================================
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'Collège Cardio 2024'
  url TEXT,
  type TEXT CHECK (type IN ('college', 'reference', 'cours', 'video')),
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FICHES (Contenu structuré des items)
-- ============================================
CREATE TABLE fiches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- 'Étiologies', 'Diagnostic', 'Traitement'
  content JSONB NOT NULL, -- Structure flexible pour tableaux/texte
  type TEXT CHECK (type IN ('text', 'table', 'list', 'mixed')),
  position INTEGER DEFAULT 0,
  source_id UUID REFERENCES sources(id),
  rang TEXT CHECK (rang IN ('A', 'B', 'AB')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fiches_item ON fiches(item_id);

-- Structure JSONB pour content (type='table'):
-- {
--   "headers": ["Cause", "Mécanisme", "Fréquence"],
--   "rows": [
--     ["Cardiopathie ischémique", "Dilatation VG", "+++"],
--     ["HTA", "Hypertrophie", "++"]
--   ],
--   "notes": "Principales causes d'IC en France"
-- }

-- ============================================
-- AUDIOS (Musique éducative)
-- ============================================
CREATE TABLE audios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  rang TEXT NOT NULL CHECK (rang IN ('A', 'B', 'mix')),
  url TEXT NOT NULL,
  stream_url TEXT,
  duration INTEGER, -- Durée en secondes
  bpm INTEGER,
  style TEXT, -- 'rap_fr', 'pop', 'electro'
  lyrics TEXT,
  suno_id TEXT, -- ID Suno pour tracking
  generation_model TEXT, -- 'V3_5', 'V4', 'V4_5'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audios_item ON audios(item_id);
CREATE INDEX idx_audios_rang ON audios(rang);

-- ============================================
-- PROFILES (Extension de auth.users)
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_current INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_best INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_study_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_goal INTEGER DEFAULT 10;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_items_revised INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_time_spent INTEGER DEFAULT 0; -- En minutes

-- ============================================
-- USER_PROGRESS (Progression par item)
-- ============================================
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'revised')),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  revision_count INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  time_spent INTEGER DEFAULT 0, -- En secondes
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_status ON user_progress(status);

-- ============================================
-- FAVORITES
-- ============================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ============================================
-- PLAYLISTS
-- ============================================
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  item_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- En secondes
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_playlists_user ON playlists(user_id);

-- ============================================
-- PLAYLIST_ITEMS
-- ============================================
CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  audio_id UUID REFERENCES audios(id),
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, item_id)
);

CREATE INDEX idx_playlist_items_playlist ON playlist_items(playlist_id);

-- ============================================
-- STUDY_SESSIONS (Pour calculer les streaks)
-- ============================================
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  items_revised INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- En minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_sessions_user_date ON study_sessions(user_id, date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Policies user_progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies favorites
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Policies playlists
CREATE POLICY "Users can view own/public playlists" ON playlists
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);
CREATE POLICY "Users can manage own playlists" ON playlists
  FOR ALL USING (auth.uid() = user_id);

-- Policies playlist_items
CREATE POLICY "Users can manage own playlist items" ON playlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_items.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- Policies study_sessions
CREATE POLICY "Users can manage own sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Fonction: Mise à jour streak automatique
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  current_streak INTEGER;
BEGIN
  SELECT last_study_date, streak_current INTO last_date, current_streak
  FROM profiles WHERE id = NEW.user_id;

  IF last_date IS NULL OR last_date < CURRENT_DATE - 1 THEN
    -- Streak cassé ou premier jour
    UPDATE profiles SET
      streak_current = 1,
      last_study_date = CURRENT_DATE
    WHERE id = NEW.user_id;
  ELSIF last_date = CURRENT_DATE - 1 THEN
    -- Jour consécutif
    UPDATE profiles SET
      streak_current = streak_current + 1,
      streak_best = GREATEST(streak_best, streak_current + 1),
      last_study_date = CURRENT_DATE
    WHERE id = NEW.user_id;
  END IF;
  -- Si last_date = CURRENT_DATE, on ne fait rien (déjà compté)

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_study_session_insert
  AFTER INSERT ON study_sessions
  FOR EACH ROW EXECUTE FUNCTION update_user_streak();

-- Fonction: Compteur playlists
CREATE OR REPLACE FUNCTION update_playlist_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE playlists SET item_count = item_count + 1 WHERE id = NEW.playlist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE playlists SET item_count = item_count - 1 WHERE id = OLD.playlist_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_playlist_item_change
  AFTER INSERT OR DELETE ON playlist_items
  FOR EACH ROW EXECUTE FUNCTION update_playlist_count();

-- Fonction: Stats progression
CREATE OR REPLACE FUNCTION get_user_progress_stats(p_user_id UUID)
RETURNS TABLE (
  total_items BIGINT,
  revised_items BIGINT,
  in_progress_items BIGINT,
  completion_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT i.id) as total_items,
    COUNT(DISTINCT CASE WHEN up.status = 'revised' THEN up.item_id END) as revised_items,
    COUNT(DISTINCT CASE WHEN up.status = 'in_progress' THEN up.item_id END) as in_progress_items,
    ROUND(
      COUNT(DISTINCT CASE WHEN up.status = 'revised' THEN up.item_id END)::NUMERIC /
      NULLIF(COUNT(DISTINCT i.id), 0) * 100,
      1
    ) as completion_percentage
  FROM items i
  LEFT JOIN user_progress up ON i.id = up.item_id AND up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 3. Critères d'Acceptation

### 3.1 Recherche + Filtres

| ID | Critère | Priorité |
|:---|:--------|:---------|
| S-01 | La recherche textuelle trouve les items par titre, code (EDN-157), et mots-clés | P0 |
| S-02 | La recherche est insensible à la casse et aux accents | P0 |
| S-03 | Les résultats apparaissent en < 300ms après 3 caractères minimum | P1 |
| S-04 | Le filtre Type (EDN/ECOS/SD) filtre correctement et est cumulable | P0 |
| S-05 | Le filtre Spécialité affiche les spécialités avec compteur d'items | P0 |
| S-06 | Le filtre Rang (A/B/Mix) filtre selon le rang principal de l'item | P1 |
| S-07 | Le filtre Statut (Non révisé/En cours/Révisé) reflète la progression utilisateur | P0 |
| S-08 | Les filtres actifs sont affichés comme chips cliquables pour suppression | P1 |
| S-09 | L'URL reflète les filtres actifs (query params) pour partage/bookmark | P2 |
| S-10 | Un bouton "Réinitialiser" supprime tous les filtres | P1 |

**Definition of Done:**
- [ ] Tests unitaires sur la logique de filtrage
- [ ] Test E2E du parcours recherche → filtre → résultats
- [ ] Performance < 300ms mesurée en staging

---

### 3.2 Affichage Tableau Responsive

| ID | Critère | Priorité |
|:---|:--------|:---------|
| T-01 | Les tableaux s'affichent correctement sur desktop (>1024px) en format classique | P0 |
| T-02 | Sur tablette (768-1024px), les colonnes se réduisent proportionnellement | P0 |
| T-03 | Sur mobile (<768px), les tableaux passent en mode "card stack" | P0 |
| T-04 | Chaque ligne de tableau mobile affiche label: valeur | P0 |
| T-05 | Les tableaux > 5 lignes sont scrollables horizontalement sur mobile | P1 |
| T-06 | Le header du tableau reste sticky en scroll vertical | P1 |
| T-07 | Les cellules longues sont tronquées avec tooltip au hover | P2 |
| T-08 | Le contenu Markdown dans les cellules est rendu correctement | P1 |
| T-09 | Les tableaux supportent le highlight de cellules importantes (+++, clé) | P2 |

**Breakpoints:**
```css
/* Mobile first */
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

**Definition of Done:**
- [ ] Screenshots de validation sur 3 breakpoints
- [ ] Testé sur iOS Safari et Chrome Android
- [ ] Lighthouse accessibility score > 90

---

### 3.3 Player Audio

| ID | Critère | Priorité |
|:---|:--------|:---------|
| A-01 | Le bouton Play/Pause alterne l'état de lecture | P0 |
| A-02 | La barre de progression affiche le temps écoulé/total | P0 |
| A-03 | Click/drag sur la barre permet de seek | P0 |
| A-04 | Le volume est ajustable via slider (0-100%) | P1 |
| A-05 | L'état volume est persisté en localStorage | P2 |
| A-06 | Previous/Next navigue dans la playlist courante | P1 |
| A-07 | La lecture continue automatiquement au prochain track | P0 |
| A-08 | Un indicateur de chargement s'affiche pendant le buffering | P0 |
| A-09 | Le player sticky reste visible pendant la navigation | P0 |
| A-10 | Click sur le titre ouvre la page détail de l'item | P1 |
| A-11 | Raccourcis clavier: Space (play/pause), ←/→ (seek ±10s) | P2 |
| A-12 | L'audio continue en background sur mobile | P1 |
| A-13 | Affichage du style musical et BPM | P2 |

**Definition of Done:**
- [ ] Test sur Chrome, Firefox, Safari, Edge
- [ ] Test lecture continue sur iOS Safari (background audio)
- [ ] Latence < 500ms au premier play

---

### 3.4 Marquage "Révisé"

| ID | Critère | Priorité |
|:---|:--------|:---------|
| R-01 | Un bouton "Marquer révisé" est visible sur la page détail | P0 |
| R-02 | Le statut passe de "not_started" → "in_progress" au premier clic | P0 |
| R-03 | Le statut passe de "in_progress" → "revised" au second clic | P0 |
| R-04 | L'utilisateur peut revenir en arrière (revised → in_progress) | P1 |
| R-05 | Un toast confirme le changement de statut | P1 |
| R-06 | Le statut est visible dans la bibliothèque (badge coloré) | P0 |
| R-07 | La révision incrémente `revision_count` dans user_progress | P0 |
| R-08 | La date `last_seen_at` est mise à jour | P0 |
| R-09 | La révision met à jour les stats de streak | P0 |

**États visuels:**
```
not_started: ○ Gris + "À réviser"
in_progress: ◐ Orange + "En cours"
revised:     ● Vert + "Révisé ✓"
```

**Definition of Done:**
- [ ] Transition d'état testée (unit + E2E)
- [ ] Sync optimiste avec rollback en cas d'erreur
- [ ] Accessible au clavier (Enter/Space)

---

### 3.5 Progression (Streak)

| ID | Critère | Priorité |
|:---|:--------|:---------|
| P-01 | Le streak affiche le nombre de jours consécutifs de révision | P0 |
| P-02 | Une révision par jour minimum maintient le streak | P0 |
| P-03 | Le streak se reset à 0 si un jour est manqué | P0 |
| P-04 | Le meilleur streak historique est affiché | P1 |
| P-05 | Animation de célébration à +5, +10, +15 jours | P2 |
| P-06 | Progress bar "Cette semaine" affiche items révisés vs objectif | P0 |
| P-07 | L'objectif hebdomadaire est configurable (5/10/15/20 items) | P2 |
| P-08 | Stats par spécialité en barres horizontales | P0 |
| P-09 | Historique des 7 derniers jours visible | P1 |
| P-10 | Le streak se calcule en timezone utilisateur | P1 |

**Calcul du streak:**
```sql
-- Jour valide = au moins 1 item marqué "revised"
-- Streak = jours consécutifs jusqu'à aujourd'hui
```

**Definition of Done:**
- [ ] Test du calcul streak avec différents scénarios (gap, reprise, timezone)
- [ ] Animation Framer Motion pour célébrations
- [ ] Données mockées pour preview sans compte

---

## 4. Backlog Sprint 1 & 2

### Sprint 1: MVP Core (2 semaines)

**Objectif:** Parcours utilisateur complet Bibliothèque → Détail → Révision

| # | Story | Points | Priorité | Risque |
|:--|:------|:------:|:--------:|:------:|
| 1.1 | **Migration DB:** Créer tables items, fiches, audios, user_progress | 3 | P0 | 🟡 Moyen |
| 1.2 | **Seed data:** Importer 20 items EDN avec fiches + audios | 2 | P0 | 🟢 Bas |
| 1.3 | **API items:** CRUD items + recherche full-text | 5 | P0 | 🟢 Bas |
| 1.4 | **Bibliothèque:** Page liste avec cards + filtres | 5 | P0 | 🟢 Bas |
| 1.5 | **Recherche:** Barre recherche + debounce + highlight | 3 | P0 | 🟢 Bas |
| 1.6 | **Détail item:** Page avec sections collapsibles | 5 | P0 | 🟡 Moyen |
| 1.7 | **Tableaux responsive:** Composant tableau adaptatif | 5 | P0 | 🟡 Moyen |
| 1.8 | **Player audio:** Intégration player existant sur détail | 3 | P0 | 🟢 Bas |
| 1.9 | **Marquage révisé:** Toggle statut + sync DB | 3 | P0 | 🟢 Bas |
| 1.10 | **User progress:** Hook + context progression | 3 | P0 | 🟢 Bas |

**Total Sprint 1:** 37 points

**Risques Sprint 1:**
| Risque | Impact | Mitigation |
|:-------|:-------|:-----------|
| Schema migration complexe | Retard 2j | Préparer rollback, tester en staging |
| Performance recherche full-text | UX dégradée | Index GIN, pagination, cache React Query |
| Tableaux cassés sur mobile | Frustration users | Design mobile-first, tests réels device |

---

### Sprint 2: Features & Polish (2 semaines)

**Objectif:** Playlists, Favoris, Progression, Polish UX

| # | Story | Points | Priorité | Risque |
|:--|:------|:------:|:--------:|:------:|
| 2.1 | **Page Progression:** Dashboard streak + stats | 5 | P0 | 🟢 Bas |
| 2.2 | **Calcul streak:** Trigger DB + affichage temps réel | 3 | P0 | 🟡 Moyen |
| 2.3 | **Page Favoris:** Liste + actions groupées | 3 | P0 | 🟢 Bas |
| 2.4 | **Playlists enhance:** Intégration items (pas juste songs) | 5 | P1 | 🟡 Moyen |
| 2.5 | **Navigation items:** Prev/Next dans détail | 2 | P1 | 🟢 Bas |
| 2.6 | **Filtres avancés:** Combinaison multi-filtres + URL sync | 3 | P1 | 🟢 Bas |
| 2.7 | **Objectifs hebdo:** Config + tracking | 3 | P2 | 🟢 Bas |
| 2.8 | **Animations:** Transitions pages + célébrations streak | 2 | P2 | 🟢 Bas |
| 2.9 | **PWA update:** Manifest + offline basics | 3 | P2 | 🟡 Moyen |
| 2.10 | **Tests E2E:** Parcours critiques (5 scénarios) | 5 | P0 | 🟢 Bas |
| 2.11 | **Bug fixes & polish:** Buffer pour imprévus | 5 | P0 | - |

**Total Sprint 2:** 39 points

**Risques Sprint 2:**
| Risque | Impact | Mitigation |
|:-------|:-------|:-----------|
| Timezone streak incorrect | Frustration users | Tester multiples TZ, utiliser date-fns-tz |
| Playlists refactor trop large | Scope creep | Garder compatibilité avec songs existants |
| PWA cache stale | Contenu obsolète | Stratégie cache-then-network |

---

### Definition of Done (Global)

- [ ] Code review passée
- [ ] Tests unitaires couvrant les cas nominaux
- [ ] Pas de régression Lighthouse (perf > 80, a11y > 90)
- [ ] Testé sur Chrome + Safari mobile
- [ ] Documentation API mise à jour
- [ ] Feature flag si nécessaire

---

### Métriques de Succès MVP

| Métrique | Cible Sprint 1 | Cible Sprint 2 |
|:---------|:---------------|:---------------|
| Items navigables | 20 | 50+ |
| Temps chargement bibliothèque | < 2s | < 1.5s |
| Taux complétion parcours | 60% | 75% |
| Streak moyen users actifs | 2 jours | 4 jours |
| Bugs critiques | 0 | 0 |
| Satisfaction utilisateur (NPS) | - | > 40 |

---

## Annexes

### A. Routes à créer/modifier

```typescript
// src/config/routes.ts - Nouvelles routes
{ path: '/med-mng/items/:itemCode', component: ItemDetail },
{ path: '/med-mng/favorites', component: Favorites },
{ path: '/med-mng/progress', component: ProgressDashboard },

// Routes existantes à enrichir
{ path: '/med-mng/library', component: MedMngLibrary }, // Ajouter filtres
{ path: '/med-mng/playlists', component: PlaylistManager }, // Support items
```

### B. Hooks à créer

```typescript
// Nouveaux hooks
useItems(filters) // Fetch items avec filtres
useItemDetail(itemCode) // Détail item + fiches + audios
useUserProgress(userId) // Progression globale
useStreak(userId) // Calcul et affichage streak
useFavorites(userId) // CRUD favoris
useResponsiveTable() // Détection breakpoint pour tableaux
```

### C. Composants à créer

```
src/components/
├── items/
│   ├── ItemCard.tsx
│   ├── ItemDetail.tsx
│   ├── ItemFilters.tsx
│   └── ItemSearch.tsx
├── fiches/
│   ├── FicheSection.tsx
│   ├── ResponsiveTable.tsx
│   └── CollapsibleSection.tsx
├── progress/
│   ├── StreakDisplay.tsx
│   ├── ProgressBar.tsx
│   ├── SpecialtyProgress.tsx
│   └── WeeklyGoal.tsx
└── favorites/
    └── FavoritesList.tsx
```
