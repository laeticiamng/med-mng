

# Correction : "Pricing" affiché en anglais dans la navigation

## Constat

Dans la barre de navigation principale (visible sur toutes les pages), le lien vers les tarifs affiche **"Pricing"** en anglais au lieu de **"Tarifs"** en francais. Cela casse la coherence linguistique de la plateforme francophone et nuit a la comprehension immediate.

## Correction

**Fichier unique :** `src/config/navigation.ts`, ligne 44

Remplacer :
```
label: 'Pricing', shortLabel: 'Pricing'
```
Par :
```
label: 'Tarifs', shortLabel: 'Tarifs'
```

## Impact

- Navigation desktop : le lien affichera "Tarifs" au lieu de "Pricing"
- Navigation mobile (menu hamburger) : idem
- Aucun autre fichier a modifier (le composant `MainNavigation.tsx` lit directement le `label` de la config)

## Statut des audits precedents

Toutes les corrections identifiees lors des 8 cycles d'audit ont ete implementees :
- Hero comprehensible en 3 secondes (OK)
- CTA inscription proéminent (OK)
- Signup avec scroll RGPD (OK)
- 16/16 modules actives (OK)
- RLS 99%, securite admin, conformite RGPD (OK)
- Cette correction "Pricing" -> "Tarifs" est le dernier detail restant

