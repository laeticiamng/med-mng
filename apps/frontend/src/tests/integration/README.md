# Tests d'intégration EDN

Ce dossier contient les tests d'intégration pour l'application EDN.

## Structure

- `edn-complete-flow.test.tsx` - Tests du flux complet de la page /edn-complete
  - Chargement initial
  - Recherche textuelle
  - Filtres rapides (complets, validés, etc.)
  - Réinitialisation des filtres
  - Ouverture du modal
  - Changement de vue (grille/liste)
  - Combinaison de filtres
  - Performance et cache

- `edn-prefetch.test.tsx` - Tests du système de prefetch
  - Préchargement des items au survol
  - Gestion du cache
  - Performance

## Exécution

```bash
# Tous les tests d'intégration
npm run test src/tests/integration

# Un fichier spécifique
npm run test src/tests/integration/edn-complete-flow.test.tsx

# Avec coverage
npm run test:coverage src/tests/integration
```

## Notes

- Ces tests utilisent des mocks de Supabase
- Les tests sont isolés et ne dépendent pas de la base de données réelle
- Chaque test nettoie ses mocks avec `beforeEach(() => vi.clearAllMocks())`
