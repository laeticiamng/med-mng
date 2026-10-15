# Quiz de mémorisation — scripts

- `verifier-bundle.mjs` : garde-fou de build (appelé par `npm run build` et la CI). Échoue si le drapeau du pilote
  statique est actif ou si une question se trouve dans `dist`.
- `../test-mm-quiz-memorisation.sh` : test Postgres réel de la migration serveur (droits, statuts, registre).

Documentation : `docs/quiz-memorisation/DISTRIBUTION-SERVEUR-ET-VALIDATION.md`.
