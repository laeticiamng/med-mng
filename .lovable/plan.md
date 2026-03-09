

# AUDIT TECHNIQUE COMPLET — MED-MNG

## 1. RESUME EXECUTIF

**Etat global** : Plateforme fonctionnellement ambitieuse (90+ pages, 115+ Edge Functions, 722 tables) mais avec une part importante de fonctionnalites mockees/simulees presentees comme operationnelles. L'architecture front est solide (React/Vite/Tailwind, lazy loading, React Query) et la securite de base est correcte (AdminRoute via user_roles, RLS 100%, test mode bloque en prod).

**Niveau de preparation reel** : 70% — la vitrine (homepage, pricing, auth) est fonctionnelle et professionnelle. Les features "premium" (Creator Studio, Memory Analytics, DPC Certification) sont des **maquettes statiques avec donnees hardcodees**, pas des fonctionnalites operationnelles.

**Verdict go-live** : **NON EN L'ETAT** — Les fonctionnalites annoncees sur la homepage (5 features bento grid) renvoient vers des composants 100% mock. Un utilisateur payant decouvrirait que le "Studio Createur" ne genere rien reellement, que les "Memory Analytics" sont des donnees aleatoires, et que la "Certification DPC" affiche des modules fictifs.

### 5 principaux P0

| # | Probleme |
|---|---------|
| 1 | **Creator Studio = mock complet** — Pas d'appel API reel, generation IA simulee par setTimeout, "Publier" ne persiste rien |
| 2 | **Memory Analytics = donnees aleatoires** — `Math.random()` pour retention, aucune donnee utilisateur reelle |
| 3 | **DPC Certification = donnees hardcodees** — Modules fictifs, certificats PDF non generes, aucune persistence |
| 4 | **3 `console.warn` non gardes dans AuthProvider** — Fuites de logs en production (lignes 30, 78, 132, 182) |
| 5 | **MedicalContentLibrary: specialty/year/retention = derives par heuristique ou random** — `getSpecialtyFromCode` base sur des ranges de numeros arbitraires, `retention: Math.random()` |

### 5 principaux P1

| # | Probleme |
|---|---------|
| 1 | **~395 fichiers avec console.log/warn/error** — 6300+ occurrences dont beaucoup non gardees par DEV |
| 2 | **LibraryPage non accessible sans login** — Route `/library` est `ProtectedRoute`, mais les CTA homepage y redirigent les visiteurs anonymes |
| 3 | **Homepage promet "Catalogue Medical" et "Studio" a des visiteurs non connectes** — Clic → redirection login sans explication |
| 4 | **CreatorStudio: aucune validation de fichier cote serveur** — Le file upload est purement client-side, jamais envoye nulle part |
| 5 | **`useMusicLibrary` toggle favori: `console.error` non garde** (ligne 203) — Fuite en production |

---

## 2. TABLEAU D'AUDIT

| Prio | Domaine | Page / Composant | Probleme | Preuve | Risque | Recommandation | Faisable immed. ? |
|------|---------|-------------------|----------|--------|--------|----------------|-------------------|
| P0 | Frontend | CreatorStudio.tsx | Generation IA = `setTimeout` mock | L.74-106: `await new Promise(r => setTimeout(...))` puis lyrics hardcodees | Utilisateur payant decoit : feature annoncee non fonctionnelle | Retirer de la homepage ou brancher sur Edge Function AI | Retirer: oui |
| P0 | Frontend | MemoryAnalytics.tsx | Donnees 100% mock | L.25: `generateMockTopics()`, L.131: `Math.random()` | Fausse promesse de suivi de memoire | Retirer de la homepage ou brancher sur donnees reelles | Retirer: oui |
| P0 | Frontend | DPCCertification.tsx | Modules fictifs, PDF non genere | L.24: `generateMockModules()`, L.105: toast sans generation PDF | Faux certificat DPC = probleme reglementaire | Retirer ou mentionner "Bientot disponible" | Oui |
| P0 | Frontend | MedicalContentLibrary.tsx | Specialty/retention = heuristique/random | L.59-88: ranges arbitraires, L.131: `Math.random()` pour retention | Donnees trompeuses | Mapper aux vrais champs BDD | Partiellement |
| P0 | Security | AuthProvider.tsx | 4 `console.warn` non gardes | L.30, 78, 132, 182 | Fuite de tokens/erreurs en prod | Wrapper avec `if (import.meta.env.DEV)` | Oui |
| P1 | UX | Homepage → /library | CTA "Decouvrir" redirige vers ProtectedRoute | ApplePlatformFeatures.tsx → `/library?tab=...` → ProtectedRoute | Visiteur anonyme → login sans contexte | Rendre /library public ou redirect vers signup avec message | Oui |
| P1 | Security | 395 fichiers | 6300+ `console.log/warn/error` dont ~50% non gardes | Recherche globale | Fuites info en prod | Audit batch + centralised logger | Non (trop large) |
| P1 | Frontend | CreatorStudio | File upload jamais envoye | L.74: `startGeneration` ne fait aucun fetch/API call | Feature factice | Brancher sur parse_document + AI | Non (secret requis) |
| P1 | UX | MedicalContentLibrary | Language filter inutile | L.130: `language: 'fr'` hardcode sur tous les tracks | Filtre EN/DE/ES retourne 0 resultats | Retirer le filtre ou alimenter en multi-langue | Oui |
| P2 | Security | AdminRoute.tsx | `console.error` non garde | L.48, 61 | Fuite en prod | Wrapper DEV | Oui |
| P2 | Frontend | DPCCertification | Bouton "Continuer" non fonctionnel | L.250: Button sans onClick handler | Bouton mort | Ajouter navigation | Oui |
| P2 | UX | MemoryAnalytics | Bouton "Reviser" non fonctionnel | L.298-305: Button sans handler reel | Promesse non tenue | Brancher vers SRS Review | Oui |
| P2 | I18n | ApplePlatformFeatures | Bouton langue ES non supporte | L.144: `setCurrentLanguage('es')` mais ES pas dans le systeme (FR/EN/DE seulement) | Erreur silencieuse | Retirer ES ou l'implementer | Oui |
| P2 | SEO | Homepage | Canonical relatif `/` | Index.tsx SEOHead `canonical="/"` | Potentiel contenu duplique | Utiliser URL absolue | Oui |
| P2 | Security | useMusicLibrary.ts | `console.error` non garde L.203 | Catch block | Fuite prod | Wrapper DEV | Oui |
| P3 | Performance | Homepage | 3 blur-3xl animated orbs simultanes | AppleHero: 3 motion.div avec blur-3xl | GPU stress mobile | Reduire a 1-2 orbes | Oui |
| P3 | A11y | ApplePlatformFeatures | Boutons langue sans label accessible | L.145-153: emoji seul comme texte | Lecteur d'ecran ne comprend pas | Ajouter aria-label | Oui |

---

## 3. DETAIL PAR CATEGORIE

### A. Frontend & Rendu
**Ce qui fonctionne** : Homepage Apple-style bien construite, lazy loading de 90+ pages, Suspense avec PageLoader, NotFound propre, theme dark/light, responsive globalement correct.

**Ce qui est casse/trompeur** :
- **Creator Studio** : Workflow complet (upload → generation → review → publish) entierement simule. Aucun appel API. La "generation IA" est un `setTimeout` de 6s. Les paroles sont hardcodees. "Publier" n'ecrit rien en BDD.
- **Memory Analytics** : `generateMockTopics()` produit des donnees aleatoires a chaque mount. La courbe d'Ebbinghaus est calculee sur des donnees fictives. Le bouton "Reviser" n'a pas de handler.
- **DPC Certification** : 6 modules fictifs hardcodes. "Telecharger PDF" affiche un toast sans generer de fichier. "Generer le certificat" idem.
- **MedicalContentLibrary** : Les specialites sont derivees par ranges numeriques arbitraires sur item_code (1-40 = cardio, etc.). La retention est `Math.random()`. La duree est random. Le filtre langue est inutile (tout est 'fr').

### B. Auth & Autorisations
**Ce qui fonctionne** : AuthProvider solide, AdminRoute verifie user_roles en BDD, ProtectedRoute redirige vers login, test mode bloque en prod par triple guard.

**Ce qui est douteux** :
- 4 `console.warn` non gardes dans AuthProvider leakent en prod
- Le signOut catch (L.182) log en prod sans DEV guard

### C. APIs & Edge Functions
**Ce qui fonctionne** : med-mng-api/types.ts CORS maintenant restreint a `med-mng.lovable.app`. Auth validation correcte dans auth.ts.

**Non confirme** : Fonctionnement reel du checkout Stripe, webhooks, generate-qcm (bug documente dans AUDIT_API_BACKEND.md).

### D. Database & RLS
**Ce qui fonctionne** : 722 tables, RLS 100%, user_roles pour admin check.

**Non confirme depuis l'interface** : Policies specifiques, search_path sur fonctions SQL.

### E. Securite
**Positif** : TEST_MODE bloque en prod, AdminRoute serveur-side, CORS restreint, security headers presents.

**Problemes** : 6300+ console statements dont beaucoup non gardes = surface d'attaque pour information disclosure.

### F. Paiement & Billing
**Pricing page** : Affiche Gratuit/Standard 19€/Pro 29€/Premium 39€. CTA fonctionnels vers checkout (non teste en live).

**Non confirme** : Stripe webhooks, portail client, content gating reel.

### G. SEO
**Positif** : SEOHead present, 10 pillar pages SEO, AutoSEO, GlobalJsonLd, meta description.

**Problemes** : Canonical relatif sur homepage (`/` au lieu d'URL absolue).

### H. I18n
**Positif** : TranslatedText couvre la majorite du frontend, LanguageSelector FR/EN/DE.

**Problemes** : ES (Espagnol) annonce dans ApplePlatformFeatures mais non supporte dans le systeme (FR/EN/DE seulement). Le bouton ES cause probablement un fallback silencieux.

### I. Observabilite
**Positif** : Sentry initialise, Google Analytics, error boundaries, health endpoints.

**Problemes** : Sentry DSN probablement non configure (mentionne dans audits precedents).

---

## 4. PLAN D'ACTION PRIORISE

### P0 — Correctifs immediats
1. **Retirer ou flaguer les features mock de la homepage** — Les 3 features (Creator Studio, Memory Analytics, DPC) doivent soit etre retirees de `ApplePlatformFeatures.tsx`, soit porter un badge "Bientot disponible"
2. **Garder les 4 console.warn dans AuthProvider** avec `if (import.meta.env.DEV)`
3. **Retirer `Math.random()` de MedicalContentLibrary** — Remplacer retention par une valeur par defaut fixe (ex: 0 ou null) ou la brancher sur `user_item_progress`

### P1 — Correctifs rapides
4. **Rendre /library accessible publiquement OU changer les CTA homepage** pour rediriger vers signup avec message contextuel
5. **Retirer le filtre langue inutile** de MedicalContentLibrary (tout est 'fr')
6. **Garder `console.error` dans AdminRoute.tsx, useMusicLibrary.ts** etc.

### P2 — Ameliorations
7. Brancher le bouton "Continuer" de DPC sur une navigation reelle
8. Brancher le bouton "Reviser" de MemoryAnalytics sur SRS Review
9. Retirer ES du selecteur langue ApplePlatformFeatures ou l'implementer
10. Passer canonical homepage en URL absolue

### P3 — Polish
11. Reduire animations GPU-heavy sur mobile
12. Ajouter aria-labels aux boutons langue emoji-only

---

## 5. IMPLEMENTATION IMMEDIATE

Les corrections suivantes seront appliquees :

1. **AuthProvider.tsx** — Wrapper les 4 `console.warn` restants avec `if (import.meta.env.DEV)`
2. **AdminRoute.tsx** — Wrapper les 2 `console.error` avec `if (import.meta.env.DEV)`
3. **ApplePlatformFeatures.tsx** — Ajouter un badge "Bientot" sur Creator Studio, Memory Analytics, DPC Certification pour ne pas tromper l'utilisateur
4. **MedicalContentLibrary.tsx** — Remplacer `Math.random()` retention par valeur fixe, retirer filtre langue inutile
5. **MemoryAnalytics.tsx** — Ajouter avertissement "Donnees de demonstration"
6. **DPCCertification.tsx** — Ajouter avertissement "Fonctionnalite en cours de developpement"
7. **CreatorStudio.tsx** — Ajouter avertissement "Preview — Generation IA bientot disponible"
8. **Index.tsx** — SEOHead canonical en URL absolue

### Elements restants (non implementables immediatement)
- Brancher Creator Studio sur une vraie Edge Function AI (necessite configuration)
- Brancher Memory Analytics sur user_item_progress (necessite donnees reelles)
- Brancher DPC sur un vrai systeme de certification (decision produit)
- Audit batch des 6300+ console statements (trop large pour une passe)
- Configuration Sentry DSN (secret externe)
- Test E2E Stripe live (acces Stripe requis)

