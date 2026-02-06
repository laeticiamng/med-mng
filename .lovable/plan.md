

# Corrections Pre-Publication : Comprehension 3s + Signup UX

## Probleme 1 : Signup -- les checkboxes RGPD sont invisibles avant le clic

**Constat reel teste en navigateur :** Quand un utilisateur remplit le formulaire et clique "Creer le compte", le navigateur affiche un message natif "Please fill out this field" qui pointe vers les checkboxes de consentement RGPD en dessous de l'ecran. L'utilisateur ne les voit pas et croit que le formulaire est casse.

**Correction :**
- Retirer l'attribut `required` natif HTML des checkboxes de consentement
- Conserver la validation cote JavaScript (qui existe deja dans `handleSubmit` lignes 51-56 avec un message explicite en francais)
- Quand les checkboxes ne sont pas cochees, afficher un message d'erreur clair ET faire un scroll automatique vers la section de consentement

**Fichier :** `src/components/med-mng/ConsentCheckboxes.tsx` -- retirer les `required` natifs sur les inputs checkbox

**Fichier :** `src/pages/MedMngSignup.tsx` -- ajouter un scroll vers la section consentement quand la validation echoue

---

## Probleme 2 : Sous-titre du Hero utilise du jargon non-universel

**Constat :** "367 items EDN. Des simulations ECOS." -- un visiteur qui decouvre le site ne sait pas ce que signifient EDN et ECOS. La comprehension ne se fait pas en 3 secondes.

**Correction :** Ajouter un contexte minimal pour les non-inities :
- "367 items EDN" -> "Les 367 cours de medecine du programme"
- "Des simulations ECOS" -> "Des mises en situation cliniques"
- Conserver le sous-texte technique ("EDN/ECOS") dans les feature pills ou en micro-texte

**Fichier :** `src/components/home/AppleHero.tsx` lignes 97-101

---

## Resume des modifications

| Fichier | Modification |
|---------|-------------|
| `src/components/med-mng/ConsentCheckboxes.tsx` | Retirer les `required` natifs HTML des checkboxes |
| `src/pages/MedMngSignup.tsx` | Ajouter scroll automatique vers les erreurs de consentement |
| `src/components/home/AppleHero.tsx` | Rendre le sous-titre comprehensible sans jargon |

---

## Section technique

### ConsentCheckboxes.tsx
Retirer tous les attributs `required` des elements `<input type="checkbox">` ou `<Checkbox>` pour eviter le message natif du navigateur. La validation reste geree par le `handleSubmit` de `MedMngSignup.tsx`.

### MedMngSignup.tsx
Dans le bloc de validation des consentements (lignes 51-56), ajouter apres `setShowConsentErrors(true)` un appel :
```typescript
document.getElementById('consent-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
```
Et ajouter `id="consent-section"` sur le wrapper des `ConsentCheckboxes`.

### AppleHero.tsx (lignes 97-101)
Remplacer :
```
367 items EDN. Des simulations ECOS.
Transformes en chansons que tu retiens.
```
Par :
```
Les 367 cours du programme medical.
Transformes en chansons que tu retiens.
```
