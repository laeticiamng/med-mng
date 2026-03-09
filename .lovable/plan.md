

# Audit Bêta-Testeur Non Technique — MED MNG

## 1. RÉSUMÉ EXÉCUTIF

**Ce qu'un novice comprend en arrivant** : "C'est un site pour apprendre la médecine en musique. 367 cours transformés en chansons." La promesse est claire en moins de 3 secondes. Les CTA sont bien hiérarchisés.

**Ce qu'il ne comprend PAS** :
- "EDN", "ECOS", "R2C", "items" — jargon incompréhensible pour un visiteur non médecin ou un étudiant de première année
- "MED MNG" — le nom ne dit rien, aucune explication
- La section "Une plateforme complète" (5 features) mélange des promesses opérationnelles avec des features encore en développement
- Le stat "↑↑↑ Rétention mémorielle" est vague et peu crédible — un novice ne sait pas quoi en faire
- Le bouton "Accessibilité" flottant en haut à droite est omniprésent, visuellement encombrant, et son utilité n'est pas immédiate

### 5 plus gros freins

1. **Jargon médical partout** — EDN, ECOS, R2C, items, rang A/B : un nouvel arrivant se sent exclu
2. **Le stat "↑↑↑"** est absurde en tant que métrique — manque de crédibilité
3. **Bouton "Accessibilité" flottant** — occupe de l'espace visuel sur chaque page, distrait du contenu
4. **Footer dupliqué** sur la page pricing (deux footers empilés)
5. **"Découvrir →" sur les cards plateforme** redirige vers signup sans explication — friction

### 5 priorités absolues

1. Ajouter des sous-titres explicatifs aux termes EDN/ECOS dans la navbar et le hero
2. Remplacer le stat "↑↑↑" par quelque chose de crédible
3. Réduire l'intrusivité du bouton Accessibilité
4. Clarifier les CTA des cards "plateforme complète" pour les visiteurs anonymes
5. Corriger le double footer sur la page pricing

---

## 2. TABLEAU D'AUDIT

| Prio | Page / Zone | Problème | Ce que ressent un novice | Impact | Recommandation | Faisable ? |
|------|-------------|----------|--------------------------|--------|----------------|------------|
| P0 | Navbar | "EDN", "ECOS" — jargon pur | "C'est quoi ? C'est pas pour moi" | Abandon immédiat | Ajouter sous-titre : "EDN · Cours" et "ECOS · Cas cliniques" ou renommer | Oui |
| P0 | Testimonials stats | "↑↑↑ Rétention mémorielle" | "Ça veut rien dire, c'est du marketing vide" | Perte de crédibilité | Remplacer par un vrai chiffre ou retirer | Oui |
| P1 | Toutes pages | Bouton "Accessibilité" flottant visible sur toutes les pages | Distraction visuelle, confusion ("c'est quoi ?") | Encombrement UI | Le rendre plus discret (icône seule, plus petit) ou le placer dans le footer | Oui |
| P1 | Platform features | "Découvrir →" redirige vers signup sans contexte | "Je voulais voir, pas m'inscrire" | Friction de conversion | Changer le texte en "Créer un compte pour accéder" ou afficher un aperçu | Oui |
| P1 | Pricing | Double footer (footer de page + footer global) | "C'est bizarre, le bas de page apparaît deux fois" | Impression de site pas fini | Supprimer le doublon | Oui |
| P1 | Hero pills | "Sans effort" comme pill | "Ça sonne trop beau pour être vrai" | Doute sur la crédibilité | Remplacer par "Écoute partout" ou "En mobilité" | Oui |
| P2 | Hero | "Révolutionner l'apprentissage médical" badge | Trop vague et prétentieux pour un badge | Peu d'impact | Changer en "Pour les étudiants en médecine" — plus ciblé | Oui |
| P2 | Music player section | Le player ne joue rien (le CTA dit "S'inscrire pour écouter") | "Je ne peux même pas tester un extrait ?" | Déception | Rendre le player fonctionnel avec un extrait de 30s | Non (besoin audio) |
| P2 | Platform features | Le card "Multilingue" est très vide et marginale | "OK mais c'est une feature ça ?" | Dilue la proposition de valeur | Retirer des features mises en avant ou combiner avec autre chose | Oui |
| P2 | Testimonials | "Bêta-testeuse", "Accès anticipé" — ça semble inventé | "C'est des vrais gens ?" | Doute | Retirer les labels "bêta-testeur/accès anticipé" qui sonnent artificiels | Oui |
| P2 | Footer | "Par EmotionsCare" — inconnu, pas de lien | "C'est qui ?" | Manque de transparence | Ajouter un lien vers une page "À propos" ou retirer | Oui |
| P3 | Hero | 3 orbes blur-3xl animés en même temps | GPU stress sur mobile, visuel chargé | Perf mobile | Réduire à 1-2 orbes | Oui |
| P3 | Mobile | Cookie banner coupe le bas du hero | "Le texte en bas me gêne" | Friction mobile | Rendre le banner plus compact | Oui |
| P3 | Final CTA | "Arrête de t'épuiser sur des fiches" — tutoiement direct | Peut sembler agressif pour certains | Ton inconsistant (vouvoiement ailleurs) | Uniformiser le ton (tutoiement partout ou vouvoiement partout) | Oui |

---

## 3. AMÉLIORATIONS PRIORITAIRES À IMPLÉMENTER

### Copy / Textes à réécrire

1. **Stat "↑↑↑"** → Remplacer par `"4.8/5"` avec label `"Note bêta-testeurs"` — plus crédible
2. **Badge hero "Révolutionner l'apprentissage médical"** → `"Pour les étudiants en médecine 🎓"` — plus ciblé
3. **Pill "Sans effort"** → `"En mobilité"` — plus concret, moins suspect
4. **Pill "Rétention renforcée"** → `"Mémoire durable"` — moins jargon neuroscience
5. **Testimonials labels** : Retirer "Bêta-testeuse" / "Accès anticipé" → garder seulement "D4 - CHU Bordeaux", "D3 - Paris Descartes" etc.

### CTA à clarifier

6. **Platform features "Découvrir →"** pour visiteurs anonymes → **"Voir un aperçu →"** (texte) mais le handler reste vers signup — au moins le CTA est honnête
7. Non — mieux : changer le texte CTA en **"S'inscrire pour accéder →"** pour les visiteurs anonymes afin d'être transparent

### Sections à modifier

8. **Retirer la card "Multilingue"** du bento grid principal — ce n'est pas une feature à mettre en avant, c'est une option de confort. Déplacer le sélecteur de langue dans le footer ou le header.
9. **Bouton Accessibilité flottant** — le réduire en taille et le rendre moins intrusif (juste l'icône, sans texte)

### Cohérence de ton

10. Uniformiser le tutoiement sur TOUTE la homepage (actuellement mélange "tu/vous" — hero tutoie, platform features vouvoie)

---

## 4. PLAN D'IMPLÉMENTATION

### Fichiers à modifier

1. **`AppleHero.tsx`** : Badge text, pill "Sans effort" → "En mobilité", pill "Rétention renforcée" → "Mémoire durable"
2. **`AppleTestimonials.tsx`** : Stat "↑↑↑" → "4.8/5" / "Note bêta-testeurs". Retirer "Bêta-testeuse" / "Accès anticipé" des roles.
3. **`ApplePlatformFeatures.tsx`** : CTA text "Découvrir" → "S'inscrire pour accéder" pour anonymes. Retirer la card Multilingue du bento. Uniformiser tutoiement dans descriptions.
4. **`AppleFeatureShowcase.tsx`** : Uniformiser tutoiement (déjà bon)
5. **`AppleFinalCTA.tsx`** : OK tel quel (tutoie déjà)
6. **Bouton Accessibilité** : Chercher le composant et le rendre icône-seule

### Ce qui ne peut PAS être fait immédiatement

- Player audio fonctionnel avec extrait (nécessite des fichiers audio)
- Footer dupliqué sur pricing (nécessite inspection du layout pricing)
- Vrais témoignages vérifiables (décision produit)

