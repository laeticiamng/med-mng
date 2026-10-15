# Quiz de mémorisation — distribution serveur et registre de validation

Infrastructure technique, **non activée** : la migration n'est pas appliquée, aucune question n'est semée, les
drapeaux sont éteints. Rien de ce qui suit n'attribue `valide_expert`.

## Architecture

| Élément | Rôle |
|---|---|
| `supabase/migrations/20261015120000_mm_quiz_memorisation_serveur.sql` | Table fermée des questions, configuration, registre de validation, RPC. **À appliquer seulement sur décision.** |
| RPC `mm_quiz_memorisation_item(p_item_code)` | Même règle d'accès que `mm_contenu_immersif_item` : item d'essai (`mm_item_gratuit`), sinon abonné Premium ou administrateur (`mm_a_acces_premium`, d'après le JWT). Sinon `{verrouille: true}`, sans question ni réponse. |
| `src/lib/quizMemorisationServeur.ts` | Appel de la RPC (`VITE_QUIZ_MEMORISATION_SERVEUR=true`), lecture défensive, erreurs absorbées (RPC absente : quiz existant seul). |
| `src/lib/quizMemorisationChargement.ts` | Source unique pour l'interface : serveur > pilote statique de préproduction > rien. |
| `src/data/quizMemorisation/export.ts` | Semis SQL (généré) et feuille de relecture CSV. |

## Garanties (toutes testées)

1. **Aucune question dans le JavaScript** en mode serveur : le module de données n'est jamais importé (test) ; le garde-fou de build reste en place.
2. **Table fermée** : RLS activée, aucun droit pour `anon` / `authenticated` (lecture comme écriture). Le front n'a aucune lecture directe (test sur le code source).
3. **Droits Gratuit/Premium côté serveur** : visiteur ou compte gratuit sur un item Premium, ou abonnement échu → verrouillé ; abonné, administrateur, item d'essai → servi (Postgres réel).
4. **Statuts servis fixés côté serveur** : par défaut `valide_expert` seul. `mm_quiz_memorisation_config.pilote = true` (service_role) ajoute `conforme_referentiel` et `verifie_source_externe`, pour une préproduction. `bloque` et `brouillon` ne sont **jamais** servis.
5. **Aucune donnée interne renvoyée** : ni extrait du référentiel, ni sources, ni justification, ni motif de blocage.
6. **`valide_expert` uniquement par le registre** : un `UPDATE` ou un `INSERT` direct est refusé par trigger, y compris pour `service_role`. Le contrôle est structurel, sans paramètre de session falsifiable : la promotion n'est acceptée que si elle s'exécute avec les droits du propriétaire de la fonction d'enregistrement **et** si le registre contient une décision `valide` pour le hash courant ; `service_role` n'a qu'un droit de lecture sur le registre (testé, y compris un `set_config` forgé). Le semis n'attribue jamais ce statut et refuse de l'exporter.
7. **Validation liée au contenu lu** : l'enregistrement exige le hash exact du contenu (calculé par le serveur), l'identité et la qualité du relecteur, les sources vérifiées ; une question `bloque` ne peut pas être validée ; une question validée dont le contenu change repasse en `bloque`. Le hash couvre tout ce qui détermine l'affichage : item, rang, compétence, type, énoncé, options, bonne réponse, explication (modifier l'un d'eux annule la validation).
8. **Décisions `a_corriger` et `refuse`** : la question passe en `bloque` (motif écrit) et cesse d'être servie, même si elle était validée ; l'historique des décisions est conservé.
9. **Le semis ne lève jamais un blocage** : le rejeu du semis conserve `bloque` (et son motif) et ne rétrograde pas une validation ; seul `mm_quiz_memorisation_lever_blocage` (un `UPDATE` direct du statut, même service_role, est refusé par trigger ; admin/service_role, décision `blocage_leve` journalisée, statut cible `conforme_referentiel` ou `verifie_source_externe`, hash exigé) rend une question non bloquée.
10. **Registre en ajout seul** : ni `UPDATE` ni `DELETE`, même pour le propriétaire (trigger).
11. **Seuls un administrateur ou le service_role** peuvent enregistrer une validation ; `anon` n'a pas le droit d'exécution.

## Registre de validation médicale

`docs/quiz-memorisation/FEUILLE-RELECTURE.csv` (28 lignes, UTF-8 avec BOM, ouvrable dans un tableur) : question,
réponses, explication, extrait du référentiel, sources, statut et motif de blocage, puis **colonnes de décision
vides** (décision, commentaire, relecteur, qualité, sources vérifiées, date). Les 6 questions bloquées y figurent avec leur
motif. Un test vérifie que le fichier versionné est à jour et que les colonnes de décision sont vides ; pour le
régénérer : `QMEMO_EXPORT_DIR=docs/quiz-memorisation npx vitest run src/data/quizMemorisation/__tests__/export.test.ts`
(écrit aussi `semis-questions.sql`, à ne pas versionner).

Enregistrer une décision humaine (administrateur ou service_role), après relecture de la version exacte :

```sql
select mm_quiz_memorisation_enregistrer_validation(
  'M247-A1', 'valide', 'Dr Prénom Nom', 'médecin, endocrinologue',
  'HAS parcours DT2 2025 (document complet lu)', 'RAS', '<contenu_hash lu dans la table>');
```

Pour une question bloquée : lever d'abord le blocage avec `mm_quiz_memorisation_lever_blocage(question_id, nouveau_statut, relecteur, motif, sources, hash)` (lire la source, la citer, reclasser en
`verifie_source_externe` ou revenir au texte du référentiel), puis soumettre à la validation.

## Activation contrôlée (dans cet ordre, une décision à chaque étape)

1. Relecture médicale des questions affichables ; décision sur les 6 bloquées.
2. Appliquer la migration (préproduction d'abord) ; semer ; vérifier `select mm_quiz_memorisation_statuts()` = `{valide_expert}`.
3. Enregistrer les validations humaines.
4. Activer `VITE_QUIZ_MEMORISATION_SERVEUR=true` sur la préproduction ; contrôle E2E des droits (item d'essai, item Premium, visiteur, abonné).
5. Production : drapeau serveur et validations uniquement ; **ne jamais** activer `mm_quiz_memorisation_config.pilote` ni `VITE_QUIZ_MEMORISATION_PILOTE`.

## Tests

- `bash scripts/test-mm-quiz-memorisation.sh` (Postgres réel ; `SEMIS=…` applique en plus le semis des 28 questions) : 59 contrôles dont droits, statuts, fermeture de la table, registre. Exécuté en CI.
- `src/lib/__tests__/quizMemorisationServeur.test.ts`, `QuizItemModes.test.tsx`, `export.test.ts`, `test/quizMemorisationBundle.test.ts`.

## Limites connues

- Les doublures de `mm_item_gratuit` / `mm_a_acces_premium` du test SQL reprennent leur logique de production ; la migration n'a pas été appliquée à la base Supabase réelle ni testée contre elle.
- Le trigger protège contre les écritures ordinaires, y compris celles de `service_role` ; un superutilisateur ou le propriétaire de la fonction peut toujours altérer la base.
- La progression « notions à revoir » reste locale à l'appareil.
