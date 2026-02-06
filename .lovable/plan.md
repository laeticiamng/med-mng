

# Roadmap v10 - Implementation des 3 Priorites Strategiques

**Statut**: Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅

**Date**: 6 Fevrier 2026
**Contexte**: Apres 8 cycles d'audit confirmant la stabilite de la plateforme, passage a la phase d'enrichissement fonctionnel.

---

## Priorites retenues

Les audits successifs ont identifie 3 axes d'evolution majeurs pour la v10 :

1. **Tracking Analytics et Conversions** (impact immediat, difficulte basse)
2. **Mode Hors-ligne EDN complet** (valeur utilisateur elevee, difficulte moyenne)
3. **Architecture RAG pour l'IA Medicale** (differentiation produit, difficulte haute)

---

## Phase 1 : Tracking Analytics et Conversions

### Objectif
Ajouter un suivi reel des evenements de conversion sur le funnel d'acquisition (visite -> inscription -> abonnement) pour remplacer les donnees simulees du dashboard executif par des metriques reelles.

### Implementation
- Creer une table Supabase `analytics_events` pour stocker les evenements (page_view, signup, checkout_start, checkout_complete)
- Ajouter des appels de tracking dans les composants cles : page d'accueil, inscription, page pricing, retour checkout Stripe
- Mettre a jour le Dashboard Executif pour lire les donnees reelles depuis `analytics_events` au lieu des valeurs simulees
- Calculer les vrais taux de conversion et variations temporelles

### Fichiers concernes
- Nouvelle table SQL : `analytics_events`
- `src/lib/analytics.ts` : fonctions d'enregistrement des evenements
- `src/pages/ExecutiveDashboard.tsx` : remplacement des donnees simulees par des requetes reelles
- `src/pages/Auth.tsx` : tracking inscription
- `src/pages/Pricing.tsx` : tracking debut checkout
- `src/pages/MedMngSuccess.tsx` : tracking conversion complete

---

## Phase 2 : Mode Hors-ligne EDN Complet

### Objectif
Permettre aux etudiants de telecharger des items EDN pour revision hors connexion, avec synchronisation automatique au retour en ligne.

### Implementation
- Etendre le Service Worker existant (PWA deja configuree) pour le cache des contenus EDN
- Utiliser IndexedDB (deja initialise dans `offlineSyncService`) pour stocker les items EDN complets
- Ajouter un bouton "Telecharger pour hors-ligne" sur chaque fiche item
- Implementer la synchronisation de la progression (quizz, flashcards) au retour en ligne
- Afficher un indicateur visuel du statut hors-ligne et du stockage utilise

### Fichiers concernes
- `src/services/offlineSyncService.ts` : extension du stockage IndexedDB pour les items EDN complets
- `src/hooks/useOfflineHistory.ts` : migration du localStorage vers IndexedDB pour les contenus volumineux
- `src/hooks/useOfflineSync.ts` : amelioration de la synchronisation bidirectionnelle
- Composants EDN : ajout du bouton de telechargement et indicateur de disponibilite hors-ligne
- `vite.config.ts` : configuration Workbox pour le pre-caching des assets critiques

---

## Phase 3 : Architecture RAG pour l'IA Medicale

### Objectif
Ameliorer la precision du chat IA medical en implementant un systeme RAG (Retrieval-Augmented Generation) qui s'appuie sur la base EDN locale plutot que sur des connaissances generales.

### Implementation
- Generer des embeddings vectoriels pour les contenus EDN (via une Edge Function avec l'API OpenAI embeddings)
- Stocker les embeddings dans une table Supabase avec l'extension `pgvector`
- Modifier l'Edge Function `enhanced-contextual-chat` pour effectuer une recherche semantique avant de generer la reponse
- Retourner les sources utilisees avec chaque reponse pour la transparence

### Fichiers concernes
- Nouvelle Edge Function : `generate-embeddings` pour l'indexation des contenus
- Nouvelle table SQL : `edn_embeddings` avec colonne vectorielle
- `supabase/functions/enhanced-contextual-chat/index.ts` : integration de la recherche semantique
- `src/hooks/useEnhancedChat.ts` : affichage des sources citees

---

## Ordre d'execution recommande

| Phase | Priorite | Effort estime | Dependances |
|-------|----------|---------------|-------------|
| 1 - Analytics | Haute | Faible | Aucune |
| 2 - Hors-ligne | Haute | Moyen | Aucune |
| 3 - RAG | Moyenne | Eleve | Extension pgvector |

La Phase 1 est recommandee en premier car elle apporte une valeur immediate au dashboard executif en remplacant les dernières donnees simulees par des metriques reelles, et sa complexite est faible.

