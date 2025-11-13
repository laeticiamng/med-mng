# Description

<!-- Décrivez brièvement les changements apportés -->

## Type de changement

- [ ] 🐛 Bug fix (changement non-breaking qui corrige un problème)
- [ ] ✨ Nouvelle fonctionnalité (changement non-breaking qui ajoute une fonctionnalité)
- [ ] 💥 Breaking change (correctif ou fonctionnalité qui entraînerait un dysfonctionnement de fonctionnalités existantes)
- [ ] 📝 Documentation (changements de documentation uniquement)
- [ ] 🔒 Sécurité (changements liés à la sécurité ou aux politiques RLS)
- [ ] 🎨 Style (changements de formatage, espaces blancs, etc.)
- [ ] ♻️ Refactoring (ni correctif ni ajout de fonctionnalité)
- [ ] ⚡️ Performance (amélioration des performances)
- [ ] ✅ Tests (ajout ou correction de tests)

## Checklist

### Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés/mis à jour
- [ ] Tous les tests passent en local
- [ ] Tests RLS exécutés si applicable (`npm run test test/rls-*.test.ts`)

### Sécurité (si applicable)
- [ ] RLS policies vérifiées
- [ ] Politiques testées pour chaque niveau de permission
- [ ] Isolation des données validée
- [ ] Aucune fuite de données identifiée
- [ ] Audit de sécurité exécuté (`npm run supabase:linter`)

### Code Quality
- [ ] Code formaté (`npm run format`)
- [ ] Linter passé (`npm run lint`)
- [ ] Pas de console.log oubliés (sauf pour le debugging intentionnel)
- [ ] Documentation à jour si nécessaire
- [ ] Commentaires ajoutés pour la logique complexe

### Database Changes (si applicable)
- [ ] Migration Supabase créée
- [ ] Migration testée localement
- [ ] Migration documentée
- [ ] Politiques RLS créées pour les nouvelles tables
- [ ] Indexes ajoutés si nécessaire pour les performances

### UI/UX (si applicable)
- [ ] Interface responsive (mobile, tablette, desktop)
- [ ] Accessibilité vérifiée (clavier, lecteur d'écran)
- [ ] Design system respecté (couleurs, tokens, composants)
- [ ] États de chargement implémentés
- [ ] Messages d'erreur clairs et utiles

### Performance
- [ ] Pas de requêtes N+1
- [ ] Images optimisées
- [ ] Lazy loading implémenté si pertinent
- [ ] Pas de re-renders inutiles

## Impact sur les performances

<!-- Décrivez l'impact sur les performances si applicable -->

## Impact sur la sécurité

<!-- Décrivez l'impact sur la sécurité si applicable -->

## Screenshots (si applicable)

<!-- Ajoutez des captures d'écran pour les changements visuels -->

## Tests effectués

<!-- Décrivez comment vous avez testé vos changements -->

## Notes pour les reviewers

<!-- Informations supplémentaires pour faciliter la review -->

## Liens connexes

<!-- Issues liées, documentation, etc. -->
- Closes #
- Related to #

---

**⚠️ IMPORTANT pour les changements RLS :**
- Les tests RLS s'exécuteront automatiquement sur ce PR
- Consultez le rapport dans les checks GitHub Actions
- Vérifiez qu'aucune régression de sécurité n'est introduite
