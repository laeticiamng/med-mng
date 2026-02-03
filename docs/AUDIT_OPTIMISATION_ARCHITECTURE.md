# 🔍 AUDIT D'OPTIMISATION ARCHITECTURE - MED-MNG v9.5
**Date :** 3 février 2026  
**Objectif :** Identifier les tables/fonctions non utilisées et proposer des consolidations

---

## 📊 RÉSUMÉ EXÉCUTIF

| Métrique | Valeur | Statut |
|----------|--------|--------|
| **Tables totales** | 723 | ⚠️ À auditer |
| **Tables vides (0 lignes)** | ~150+ | 🔴 Candidates à suppression |
| **Fonctions SQL** | 462 | ⚠️ À consolider |
| **Edge Functions** | 134 | ⚠️ Redondances identifiées |
| **Routes actives** | 97 | ✅ OK |

---

## 🔴 TABLES VIDES CANDIDATES À SUPPRESSION

Ces tables n'ont **aucune donnée** et pourraient être supprimées après validation :

### Catégorie : EmotionsCare (Legacy/Non utilisé)
| Table | Lignes | Recommandation |
|-------|--------|----------------|
| `emotionscare_songs` | 0 | ❌ Supprimer |
| `emotionscare_song_likes` | 0 | ❌ Supprimer |
| `emotionscare_user_songs` | 0 | ❌ Supprimer |
| `emotionsroom_favorites` | 0 | ❌ Supprimer |
| `emotionsroom_rooms` | 0 | ❌ Supprimer |
| `emotionsroom_sessions` | 0 | ❌ Supprimer |
| `emotionsroom_participants` | 0 | ❌ Supprimer |
| `emotionsroom_webrtc_answers` | 0 | ❌ Supprimer |
| `emotionsroom_ice_candidates` | 0 | ❌ Supprimer |
| `emotions` | 0 | ❌ Supprimer |
| `emotion_metrics` | 0 | ❌ Supprimer |

### Catégorie : Métriques VR (Non implémenté)
| Table | Lignes | Recommandation |
|-------|--------|----------------|
| `metrics_vr_breath` | 0 | ❌ Supprimer |
| `metrics_vr_galaxy` | 0 | ❌ Supprimer |
| `metrics_bubble_beat` | 0 | ❌ Supprimer |
| `metrics_flash_glow` | 0 | ❌ Supprimer |
| `metrics_face_filter` | 0 | ❌ Supprimer |
| `metrics_emotion_scan` | 0 | ❌ Supprimer |

### Catégorie : Fonctionnalités non lancées
| Table | Lignes | Recommandation |
|-------|--------|----------------|
| `jam_rooms` | 0 | ❌ Supprimer (Jam Sessions non actif) |
| `jam_participants` | 0 | ❌ Supprimer |
| `jam_sessions` | 0 | ❌ Supprimer |
| `recording_projects` | 0 | ❌ Supprimer |
| `voice_journal_entries` | 0 | ❌ Supprimer |
| `medilinko_consultations` | 0 | ❌ Supprimer |
| `urgegpt_protocols` | 0 | ❌ Supprimer |

### Catégorie : Analytics redondants
| Table | Lignes | Recommandation |
|-------|--------|----------------|
| `user_analytics` | 0 | 🟡 Fusionner avec `user_activity_log` |
| `page_analytics` | 0 | 🟡 Fusionner avec `pwa_metrics` |
| `medical_learning_analytics` | 0 | 🟡 Fusionner avec `user_study_sessions` |

### Catégorie : Musique redondante
| Table | Lignes | Recommandation |
|-------|--------|----------------|
| `music_play_logs` | 0 | 🟡 Fusionner avec `user_listening_events` |
| `music_skip_logs` | 0 | 🟡 Fusionner avec `user_listening_events` |
| `music_completion_logs` | 0 | 🟡 Fusionner avec `user_listening_events` |
| `music_sessions` | 0 | 🟡 Fusionner avec `user_music_library` |
| `music_generation_logs` | 0 | 🟡 Fusionner avec `med_mng_generation_logs` |
| `unified_music_generation` | 0 | 🟡 Fusionner avec `med_mng_songs` |

### Catégorie : Communauté non utilisée
| Table | Lignes | Recommandation |
|-------|--------|----------------|
| `posts` | 0 | 🟡 Conserver (Community Hub planifié) |
| `comments` | 0 | 🟡 Conserver |
| `groups` | 0 | 🟡 Conserver |
| `buddies` | 0 | 🟡 Conserver |
| `challenges` | 0 | 🟡 Conserver |

---

## 🔴 FONCTIONS SQL REDONDANTES

### Répartition actuelle (462 fonctions)
| Catégorie | Nombre | Action |
|-----------|--------|--------|
| `utility` | 214 | ⚠️ Auditer doublons |
| `write` (update/set) | 101 | ✅ OK |
| `read` (get/fetch) | 76 | ✅ OK |
| `med_mng_api` | 26 | ✅ Core API |
| `security` (has/check) | 17 | ✅ Critique |
| `trigger/handle` | 10 | ✅ OK |
| `create/insert` | 10 | ✅ OK |
| `refresh` | 5 | ✅ OK |
| `batch/run` | 2 | ✅ OK |
| `delete` | 1 | ✅ OK |

### Doublons identifiés à fusionner
| Fonction 1 | Fonction 2 | Action |
|------------|------------|--------|
| `create_user_session` | `create_user_session` (doublon) | ❌ Supprimer doublon |
| `get_all_role_audit_logs` | `get_all_role_audit_logs` (doublon) | ❌ Supprimer doublon |
| `med_mng_decrement_quota` | `med_mng_decrement_quota` (doublon) | ❌ Supprimer doublon |

---

## 🔴 EDGE FUNCTIONS REDONDANTES

### Total : 134 fonctions → Objectif : ~50 consolidées

### Redondances identifiées

#### IA/Chat (à consolider en `ai-core`)
| Fonction | Statut | Action |
|----------|--------|--------|
| `chat-with-ai` | ✅ Actif | 🟡 Fusionner dans `ai-core` |
| `contextual-ai-chat` | ✅ Actif | 🟡 Fusionner dans `ai-core` |
| `enhanced-contextual-chat` | ⚠️ Doublon | ❌ Supprimer |
| `medical-chat-ai` | ✅ Actif | 🟡 Fusionner dans `ai-core` |
| `openai-chat` | ✅ Actif | 🟡 Fusionner dans `ai-core` |
| `ai-tutor` | ✅ Actif | 🟡 Fusionner dans `ai-core` |

#### Génération contenu (à consolider en `ai-content`)
| Fonction | Statut | Action |
|----------|--------|--------|
| `generate-qcm` | ✅ Actif | ✅ Déjà dans router |
| `qcm-generator` | ⚠️ Doublon | ❌ Supprimer |
| `generate-content` | ✅ Actif | ✅ Déjà dans router |
| `content-ai-generator` | ⚠️ Doublon | ❌ Supprimer |
| `generate-missing-content` | ⚠️ Legacy | 🟡 Migrer vers `ai-content` |

#### Extraction EDN (à consolider en un seul router)
| Fonction | Statut | Action |
|----------|--------|--------|
| `extract-edn-uness` | ✅ Actif | ✅ Conserver comme principal |
| `extract-edn-uness-auth` | ⚠️ Variante | ❌ Fusionner |
| `extract-edn-uness-complete` | ⚠️ Variante | ❌ Fusionner |
| `extract-edn-uness-production` | ⚠️ Variante | ❌ Fusionner |
| `secure-edn-extraction` | ⚠️ Variante | ❌ Fusionner |

#### Test/Debug (à supprimer en production)
| Fonction | Statut | Action |
|----------|--------|--------|
| `test-batch-50` | 🧪 Test | ❌ Supprimer |
| `test-cas-simple` | 🧪 Test | ❌ Supprimer |
| `test-edn-extraction` | 🧪 Test | ❌ Supprimer |
| `test-extraction-sample` | 🧪 Test | ❌ Supprimer |
| `test-insertion-directe` | 🧪 Test | ❌ Supprimer |
| `test-login` | 🧪 Test | ❌ Supprimer |
| `test-oic-curl` | 🧪 Test | ❌ Supprimer |
| `test-webhook` | 🧪 Test | ❌ Supprimer |
| `debug-oic-extraction` | 🧪 Debug | ❌ Supprimer |
| `debug-uness-auth` | 🧪 Debug | ❌ Supprimer |

---

## 📋 PLAN D'ACTION RECOMMANDÉ

### Phase 1 : Nettoyage immédiat (Semaine 1)
1. **Supprimer les 11 tables EmotionsCare** (non utilisées, projet legacy)
2. **Supprimer les 6 tables VR** (fonctionnalité jamais lancée)
3. **Supprimer les 10 Edge Functions de test/debug**
4. **Corriger les 3 fonctions SQL en doublon**

**Impact estimé :** -27 tables, -10 Edge Functions, -3 fonctions SQL

### Phase 2 : Consolidation (Semaine 2-3)
1. **Fusionner les tables analytics** (3 tables → 1)
2. **Fusionner les tables musique** (6 tables → 2)
3. **Consolider les Edge Functions IA** (6 → 1 router `ai-core`)
4. **Consolider les Edge Functions EDN** (5 → 1)

**Impact estimé :** -8 tables, -9 Edge Functions

### Phase 3 : Optimisation (Mois 2)
1. **Archiver les tables communauté** si non utilisées après 6 mois
2. **Auditer les 214 fonctions utilitaires** pour identifier les doublons
3. **Documenter l'architecture consolidée**

---

## 📊 OBJECTIFS FINAUX

| Métrique | Actuel | Objectif | Réduction |
|----------|--------|----------|-----------|
| Tables | 723 | ~580 | -20% |
| Fonctions SQL | 462 | ~400 | -13% |
| Edge Functions | 134 | ~80 | -40% |

---

## ✅ VALIDATION

Ce rapport d'audit a été généré automatiquement le 3 février 2026.

Pour exécuter le nettoyage :
1. Valider les tables candidates avec l'équipe métier
2. Créer des migrations de suppression progressives
3. Tester en environnement staging
4. Déployer par phases

---

*Audit réalisé par Lovable AI - MED-MNG Platform v9.5*
