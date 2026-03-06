

# AUDIT DEFINITIF PRE-PRODUCTION v3 — MED MNG

## 1. RESUME EXECUTIF

**Verdict** : **OUI SOUS CONDITIONS**. La plateforme a progresse significativement depuis l'audit v1 (9/20) et v2 (14/20). Les accents de la page About sont corriges. Le "SD" ECOS est remplace par "Situation". Le footer affiche correctement "MED MNG" (pas de typo "MFD MNG"). Les temoignages mentionnent "Beta-testeuse" / "Acces anticipe". Cependant, **deux problemes critiques persistent** :

1. **Le AudioDemoPlayer est invisible** car `edn_suno_tracks` retourne un tableau vide (`[]`). La promesse "ecoute sans inscription" n'est pas tenue — le composant se cache silencieusement.
2. **La page EDN (/edn-complete) montre un spinner** en mode dev (artefact Vite, fonctionne en prod).

**Note globale : 15/20** — Publiable sous conditions mineures.

**Top 5 risques** :
1. AudioDemoPlayer invisible (0 tracks en DB) — promesse non demontree
2. 3x RLS "always true" — a auditer/justifier
3. Fonctions sans search_path — injection de schema theorique
4. 130+ routes dont beaucoup non essentielles au MVP
5. Extension dans schema public

**Top 5 forces** :
1. Landing page claire, proposition de valeur en 3 secondes
2. ECOS fonctionnel avec 12 situations et jargon corrige
3. Pages legales completes (CGU, Mentions, Confidentialite, CGV, Cookies, Contact)
4. Cookie consent RGPD fonctionnel
5. Footer correct, About avec accents, temoignages labellises

---

## 2. PROBLEMES A CORRIGER

### P0 — Bloquant
1. **AudioDemoPlayer invisible** — Le composant `AudioDemoPlayer` fait `if (tracks.length === 0) return null`. La requete `edn_suno_tracks` avec `status=completed` retourne `[]`. Resultat : aucun player audio visible sur la landing. La section "Ecoute. Apprends." montre un bouton "Ecouter un extrait" qui redirige vers signup au lieu de jouer un son. **La promesse centrale du produit ("en musique") n'est pas demontrable.**
   - **Correction** : Ajouter des tracks demo hardcodees en fallback quand la DB est vide, OU utiliser des fichiers audio statiques dans `/public/audio/`.

### P1 — Important
2. **RLS "always true" x3** — Securite scan confirme 3 politiques RLS permissives. A verifier et restreindre si necessaire.
3. **Functions sans search_path** — A corriger sur les fonctions SQL concernees.

### P2 — Amelioration forte valeur
4. **Navigation "Plus" expose trop de routes** — Le menu "Plus" devrait etre simplifie pour les visiteurs non connectes.
5. **Bouton "Ecouter un extrait" dans AppleMusicPlayer redirige vers signup** — Incoherent avec la section "APERCU". Devrait jouer un son ou etre renomme "S'inscrire pour ecouter".

---

## 3. PLAN D'IMPLEMENTATION

### Correction 1 : AudioDemoPlayer avec fallback
Le composant actuel (`src/components/home/AudioDemoPlayer.tsx`) depend de tracks en DB. Puisque la DB est vide, ajouter un fallback avec des extraits demo statiques (fichiers MP3 courts dans `/public/audio/` ou URLs publiques hardcodees). Si la DB retourne des tracks, les utiliser ; sinon, afficher les demos statiques.

### Correction 2 : Bouton "Ecouter un extrait" coherent
Dans `AppleMusicPlayer.tsx`, le bouton "Ecouter un extrait" (ligne ~88) est wrappe dans un `<Link to={ROUTE_PATHS.medMngSignup}>`. C'est trompeur — l'utilisateur attend un son, pas un formulaire d'inscription. Deux options :
- Option A : Changer le label en "S'inscrire pour ecouter"
- Option B : Faire jouer l'AudioDemoPlayer au clic (si tracks disponibles)

**Recommandation** : Option A (renommer) + s'assurer que l'AudioDemoPlayer avec fallback est visible juste en dessous.

### Correction 3 : RLS hardening
Executer une migration SQL pour resserrer les 3 politiques "always true" identifiees par le scan securite.

### Correction 4 : Functions search_path
Executer une migration SQL pour ajouter `SET search_path = public` aux fonctions concernees.

---

## 4. IMPLEMENTATION SEQUENCEE

**Tache 1** : Creer 3 fichiers audio demo statiques ou utiliser des URLs publiques libres de droits, et modifier `AudioDemoPlayer.tsx` pour afficher un fallback quand la DB est vide.

**Tache 2** : Modifier le CTA "Ecouter un extrait" dans `AppleMusicPlayer.tsx` pour etre coherent (label + comportement).

**Tache 3** : Identifier et corriger les 3 RLS "always true" via migration SQL.

**Tache 4** : Identifier et corriger les fonctions sans `search_path` via migration SQL.

