# 🗄️ DOCUMENTATION BASE DE DONNÉES - MED-MNG

**Objectif** : Simplifier et documenter l'usage des tables pour réduire la dette technique.

---

## 📊 Vue d'ensemble

- **Tables estimées** : ~50-80 actives
- **Fonctions SQL** : 368 (toutes sécurisées)
- **Politiques RLS** : 200+

---

## 🎯 Tables Principales (Cœur de métier)

### Utilisateurs & Authentification

| Table | Usage | Critique |
|-------|-------|----------|
| `profiles` | Profils utilisateurs | ✅ Oui |
| `user_settings` | Préférences utilisateur | ✅ Oui |
| `user_onboarding` | Statut onboarding | Non |
| `user_roles` | Rôles (admin, user) | ✅ Oui |

### Contenu Médical

| Table | Usage | Critique |
|-------|-------|----------|
| `edn_items` | Items EDN (367 items) | ✅ Oui |
| `edn_items_complete` | Vue complète items | ✅ Oui |
| `ecos_stations` | Stations ECOS | ✅ Oui |
| `ai_generated_content` | Contenus IA | Non |

### Apprentissage

| Table | Usage | Critique |
|-------|-------|----------|
| `flashcard_decks` | Paquets de flashcards | ✅ Oui |
| `flashcards` | Cartes individuelles | ✅ Oui |
| `flashcard_reviews` | Historique révisions | ✅ Oui |
| `srs_progress` | Progression SRS | ✅ Oui |
| `srs_review_history` | Historique SRS | Non |

### Génération Musicale

| Table | Usage | Critique |
|-------|-------|----------|
| `music_generations` | Chansons générées | ✅ Oui |
| `music_generation_history` | Historique | Non |
| `user_music_library` | Bibliothèque user | Non |

### Gamification

| Table | Usage | Critique |
|-------|-------|----------|
| `user_badges` | Badges obtenus | Non |
| `gamification_activities` | Activités XP | Non |
| `user_streaks` | Séries de jours | Non |
| `leaderboard_entries` | Classement | Non |

### Conversations IA

| Table | Usage | Critique |
|-------|-------|----------|
| `chat_conversations` | Conversations | ✅ Oui |
| `chat_messages` | Messages | ✅ Oui |
| `ai_chat_feedback` | Feedback | Non |

---

## ⚠️ Tables Candidates à la Simplification

Ces tables pourraient être consolidées ou supprimées :

| Table | Raison | Action suggérée |
|-------|--------|-----------------|
| `*_history` (multiples) | Redondance | Consolider en audit_log |
| `*_metrics` (multiples) | Trop granulaire | Agrégation hebdomadaire |
| Tables de cache | Possible obsolescence | Évaluer l'usage |

---

## 🔒 Sécurité des Tables

Toutes les tables ont :
- ✅ RLS activé
- ✅ Politiques par user_id
- ✅ Fonctions avec search_path sécurisé

---

## 📝 Recommandations

1. **Audit trimestriel** : Identifier les tables non utilisées
2. **Archivage** : Déplacer les données anciennes
3. **Index** : Vérifier les index sur les clés étrangères
4. **Documentation** : Maintenir ce fichier à jour

---

*Dernière mise à jour : Février 2025*
