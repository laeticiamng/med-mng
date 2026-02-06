

# Corrections critiques identifiees par l'audit

## Problemes trouves lors de l'inspection live

### 1. Page `/med-mng/create` bloquee sur "Chargement des items..." (Bug critique - Beta testeur)
Le composant `ItemSelector.tsx` ne charge pas les 367 items. La derniere correction a bascule vers `fetch` direct mais le probleme persiste. Le fix precedent est correct architecturalement (fetch REST direct avec fallback timeout de 8s), mais il faut verifier que le composant est bien deploye et que l'utilisateur voit la version corrigee.

**Action** : Verifier le composant apres rebuild. Si le probleme persiste, ajouter un log visible et s'assurer que le timeout de 8s declenche bien le fallback.

---

### 2. Bouton ECOS contradictoire dans MainSections (Head of Design / Beta testeur)
Le badge ECOS affiche "Disponible" mais le bouton est toujours `disabled` avec le texte "Bientot disponible" (ligne 217-221 de `MainSections.tsx`). C'est une incoherence directe qui cree de la confusion.

**Action** : Supprimer le `disabled` sur le bouton ECOS et remplacer "Bientot disponible" par "Acceder" avec la fleche, comme les autres sections.

**Fichier** : `src/components/home/MainSections.tsx` lignes 217-221
```
// Avant:
<Button ... disabled={section.id === "ecos"}>
  {section.id === "ecos" ? "Bientôt disponible" : "Accéder"}
  {section.id !== "ecos" && <ArrowRight />}
</Button>

// Apres:
<Button ... >
  Accéder
  <ArrowRight />
</Button>
```

---

### 3. Routes `/signup` et `/login` renvoient une 404 (Beta testeur / COO)
Les CTAs redirigent vers `/med-mng/signup` et `/med-mng/login`, mais un utilisateur tapant `/signup` ou `/login` directement obtient une page 404. C'est un point d'abandon critique.

**Action** : Ajouter des redirections dans `App.tsx` :
- `/signup` redirige vers `/med-mng/signup`
- `/login` redirige vers `/med-mng/login`
- `/pricing` redirige vers `/med-mng/pricing`

**Fichier** : `src/App.tsx` — ajouter 3 lignes `<Route path="/signup" element={<Navigate to="/med-mng/signup" replace />} />`

---

### 4. Verification CDO : Coherence des sources de donnees
Le `ItemSelector` utilise `edn_items_complete` (source de verite confirmee, 367 lignes). Les constantes Supabase sont correctement centralisees dans `supabaseConstants.ts`. La table a une politique RLS de lecture publique. Pas de probleme de coherence des sources.

---

## Resume des corrections

| # | Probleme | Severite | Fichier |
|---|----------|----------|---------|
| 1 | Chargement items bloque | Critique | `ItemSelector.tsx` (deja corrige, a verifier) |
| 2 | Bouton ECOS disabled/contradictoire | Moyen | `MainSections.tsx` |
| 3 | URLs `/signup`, `/login` = 404 | Eleve | `App.tsx` |

Temps estime : 5 minutes. Aucune modification de base de donnees requise.
