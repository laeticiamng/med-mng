
# Phase 5-8 : Execution Continue de la Roadmap Strategique

## Recap des phases completees
- Phase 1 : Build fix (erreurs TS corrigees)
- Phase 2 : Nettoyage (14 Edge Functions supprimees)
- Phase 3 : Monetisation (3 tiers, pricing simplifie)
- Phase 4 : SEO (5 pages piliers creees)

---

## Phase 5 : Mode Examen Focus (cette session)

Le mode examen actuel (`ExamMode.tsx`, 758 lignes) est fonctionnel mais trop complexe. L'objectif est de le simplifier pour une experience "EDN Blanc" professionnelle.

### 5.1 — Simplifier l'interface de lancement
- Supprimer le bouton "Configuration avancee" et le composant `ExamConfig` du flow principal
- Remplacer par 2 modes clairs : "EDN Blanc" (20 QCM, 30 min, timer strict) et "ECOS Rapide" (10 stations, 15 min)
- Garder les 2 cards existantes (Mode IA / Mode Standard) mais renommer "Mode Standard" en "EDN Blanc officiel"

### 5.2 — Ajouter le Percentile National Simule
- Creer un composant `ExamPercentile.tsx` dans `src/components/exam/`
- Algorithme : calculer le percentile base sur l'historique des scores de tous les utilisateurs (`exam_history` table)
- Afficher apres completion : "Vous etes dans le top X% des etudiants"
- Afficher un badge visuel (bronze < 50%, argent 50-80%, or > 80%)
- Integrer dans la section resultats du `ExamMode.tsx`

### 5.3 — Score par competence
- Apres examen, afficher un breakdown par specialite/item_code
- Utiliser les donnees deja presentes dans `answers` (item_code par question)
- Ajouter un graphique radar simple avec les 5 specialites les plus testees

---

## Phase 6 : Cas Cliniques Premium

Le composant `ClinicalCases.tsx` (539 lignes) existe deja avec hooks `useClinicalCases` et `useAIClinicalCases`.

### 6.1 — Badge "Cas Expert Valide"
- Ajouter dans `useGamification` un nouveau badge `clinical_expert`
- Condition de deblocage : completer 10 cas cliniques avec score > 70%
- Afficher le badge dans le profil et dans `ExamRanking`

### 6.2 — Notation par competence ECOS
- Apres chaque cas clinique, afficher un score par competence UNESS
- Reutiliser les grilles UNESS existantes (`EcosUNESSGrid`, `GRILLES_UNESS`)
- Ajouter une section "Competences evaluees" dans les resultats

---

## Phase 7 : Performance

### 7.1 — Optimisations cles
- Ajouter `React.memo` sur les composants lourds des resultats d'examen
- Configurer `staleTime` et `gcTime` optimises dans React Query pour les items EDN (donnees stables)
- Verifier que le lazy loading est bien en place sur toutes les pages non-critiques (deja fait pour ExamConfig et ExamHistory)

### 7.2 — Bundle audit
- Verifier les imports lourds (framer-motion, recharts) et s'assurer qu'ils sont tree-shakes
- Ajouter `loading="lazy"` sur les images medicales dans les cas cliniques

---

## Phase 8 : Cockpit CEO

### 8.1 — Page Executive Dashboard
La route `/executive-dashboard` existe deja dans les routes. Creer le composant avec :
- **DAU/WAU/MAU** : requete sur `user_activity_log` groupee par jour/semaine/mois
- **Funnel** : inscription → premier examen → completion → paiement (basee sur les tables existantes)
- **Taux de completion** : examens completes / examens demarres
- **Score moyen** : moyenne des scores d'examen
- **Top specialites** : specialites les plus revisees

### 8.2 — Metriques temps reel
- Utiliser React Query avec `refetchInterval: 60000` pour rafraichir les donnees
- Afficher avec des cartes Recharts (deja installe)

---

## Details techniques

### Fichiers a creer
1. `src/components/exam/ExamPercentile.tsx` — composant percentile national
2. `src/pages/ExecutiveDashboard.tsx` — cockpit CEO

### Fichiers a modifier
1. `src/pages/ExamMode.tsx` — simplifier le flow, integrer percentile
2. `src/pages/ClinicalCases.tsx` — ajouter badge et notation ECOS
3. `src/hooks/useGamification.ts` — ajouter badge `clinical_expert`
4. `src/hooks/useExamMode.ts` — ajouter calcul percentile
5. `src/App.tsx` — connecter la route executive-dashboard

### Priorite d'execution
1. Phase 5 (Examen) — impact utilisateur direct
2. Phase 8 (Cockpit) — visibilite business
3. Phase 6 (Cas cliniques badges) — gamification
4. Phase 7 (Performance) — optimisation continue
