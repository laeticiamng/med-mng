# Quiz de mémorisation — diagnostic, proposition, pilote, GO/NO-GO

15.10.2026 · branche `claude/med-mng-quiz-memorization-trxqcp` · aucune donnée supprimée ni modifiée en base
(requêtes `SELECT` uniquement) · rien n'est activé en production.

## 1. Diagnostic

### Ce que les utilisateurs voient réellement

| Constat | Preuve |
|---|---|
| Le seul quiz affiché est `OicQuizGenerator` : « quel énoncé correspond à la compétence X ? », 10 questions maximum, 4 options. | `EnhancedQuizFinal` écarte les questions stockées (toutes génériques) et bascule sur lui. |
| Les 1101 questions de `edn_items_complete.quiz_questions` (3 × 367) sont 3 gabarits où seul le numéro d'item change. Elles sont filtrées par `estQuestionQuizGenerique` : **jamais affichées**. | Requête : 1101/1101 correspondent aux 3 motifs. |
| Les **734** questions de `edn_items_immersive.quiz_questions` (2 × 367) sont deux autres gabarits, avec des distracteurs fabriqués (« Compétence générique item 1 », « Notion de base standard », « Principe théorique classique »). **Aucun écran ne les lit** : la RPC `mm_contenu_immersif_item` sert la colonne de `edn_items_complete`, et plus aucun `select` du front ne demande cette colonne. Leur motif n'était **pas** reconnu par `estQuestionQuizGenerique` : corrigé (§3), pour qu'un futur consommateur ne les affiche jamais. | Requêtes + `grep` du front et des Edge Functions. |
| `SELECT` sur `quiz_questions` retiré à `anon` et `authenticated` (phase 2 appliquée) ; pas de policy d'écriture pour eux. | `information_schema.column_privileges`, `pg_policies`. |

### Dépendances des 734 (et des 1101) — pourquoi on ne supprime rien

20 fonctions `SECURITY DEFINER` de la base citent `quiz_questions` (`mm_contenu_immersif_item`,
`mm_etat_contenu_immersif`, `calculate_item_completeness_score`, `run_automated_completeness_audit`,
`get_platform_completion_stats`, `merge_all_tables_into_complete`, `fix_all_edn_items_*`, `fusion_complete_finale`,
`migrate_edn_items_*`…), dont 17 lisent aussi `edn_items_immersive`. Côté front : badges « Quiz » (`EdnItemApercu`,
`EdnItemCard`) et statut « quiz renseigné » du gestionnaire de contenu, **vrais pour les 367 items à cause de ces
gabarits**. Supprimer ou vider ces colonnes changerait des scores de complétude et des audits : à faire dans une
migration dédiée, avec retour arrière, après revue de ces fonctions. **Non fait.**

### Qualité du quiz « Reconnaître les compétences »

| Constat | Mesure |
|---|---|
| Une seule forme de question, reconnaissance d'un texte identique. Ne vérifie aucune connaissance médicale. | code |
| Options illisibles : 90 % des descriptions officielles dépassent 260 caractères et sont coupées avec « … » ; 397 contiennent un tableau (`\|`). | 4396/4872 ; 397/4872 |
| Correction **uniquement à la fin** ; pas de rappel actif ; pas de mémoire des erreurs (seulement « Recommencer »). | code |
| Items à peu de compétences : 81 items < 8 compétences (distracteurs pris dans l'item voisin `IC-n±1`, donc hors sujet → élimination par le thème) ; 9 items < 4 ; 2 items sans rang A ; 11 sans rang B ; 78 items < 4 compétences de rang A, 114 < 4 de rang B. | requêtes |
| Cadrage « examen » : 200 points « perfectExam » pour 100 %, « Quiz terminé ! » avec trophée. | `OicQuizGenerator.tsx` |
| Usage mesuré très faible : `quiz_results` = 6 lignes (2 utilisateurs, 03–04.10.2026) ; `revision_history` = 0. | requêtes |
| Droits : l'onglet Quiz fait partie de `SEGMENTS_PREMIUM` → Gratuit : les 10 items d'essai ; Premium : 367 items ; sinon `EncartPremium`. Les compétences OIC restent publiques (fiches gratuites). | `EdnItemLayout.tsx`, `offre.ts` |

Écarts annexes constatés, **non modifiés** : la description SEO de l'onglet Quiz annonce « QCM, QRU et questions
ouvertes » (`ednItemTabs.ts`) ; `med-mng-api/routes/verify.ts` interroge une table `quiz_questions` qui n'existe pas.

## 2. Proposition pédagogique

Deux modes, un seul écran « Quiz » par item :

1. **Mémoriser** (nouveau, pilote) — séries de **5 notions**, une par écran, ~2 minutes.
   - *QCM court* (4 options, une seule bonne réponse, distracteurs plausibles) et *rappel actif* (on formule la
     réponse, on la révèle, on s'auto-évalue « Je le savais » / « À revoir »).
   - Correction immédiate, **explication de 1–2 phrases**, aucune minuterie, aucun vocabulaire de concours.
   - Profondeur par rang : « Les essentiels » (rang A) / « Pour aller plus loin » (rang B).
   - **Notions à revoir** : une erreur met la question en tête des séries suivantes ; une réussite l'en retire ;
     « Revoir les notions manquées » rejoue immédiatement les seules erreurs de la série.
2. **Reconnaître les compétences** (existant, conservé) — mention ajoutée : « entraîne la reconnaissance du
   référentiel ; il ne vérifie pas vos connaissances médicales ». Titre « Quiz de l'item IC-x » conservé (les E2E de
   production le testent).

Passerelle : depuis les pages Rang A, Rang B, Musique et Planches, un encart discret mène au quiz de l'item. Il
n'apparaît que si le pilote est actif, que l'item a des questions et que l'utilisateur a accès au quiz (jamais de lien
vers l'encart Premium).

Réutilisé : `quiz_results` + `enregistrerProgressionQuiz` (historique `/edn-complete`, répétition espacée), composants
UI existants, `useFicheItemEdn`, `cheminItemEdn`. Non repris volontairement : points et badges « examen ».

## 3. Ce qui a été livré

| Élément | Fichiers |
|---|---|
| Données du pilote + traçabilité (extrait du référentiel, réponse, justification, sources, statut) | `src/data/quizMemorisation/` |
| Logique pure (séries, notions à revoir, stockage tolérant aux pannes) | `src/utils/quizMemorisation.ts` |
| Interface mobile | `src/components/edn/quiz/QuizMemorisation.tsx`, `QuizItemModes.tsx`, `LienQuizItem.tsx` |
| Drapeau + chargement paresseux | `src/lib/quizMemorisationChargement.ts` |
| Intégration (3 lignes) | `EnhancedQuizFinal.tsx`, pages `EdnItemRangA/B/Musique/Planches` |
| Gabarits des 734 reconnus comme génériques | `src/utils/tableauTransformations.ts` |
| Registre de vérification | `docs/quiz-memorisation/REGISTRE-VERIFICATION.md` |

### Le pilote : 28 questions, 3 items

| Item | Rôle | Compétences | Questions |
|---|---|---|---|
| IC-247 Diabète | **essai gratuit**, riche | 31 | 11 (8 A, 3 B) |
| IC-217 Syndrome mononucléosique | **Premium**, moyen | 6 | 9 (6 A, 3 B) |
| IC-160 Tétanos | **peu de compétences** (Premium) | 4 (3 A, 1 B) | 8 (6 A, 2 B) |

Statuts après la revue scientifique du 15.10.2026 (2ᵉ passe) : 12 `verifie_source_externe`, 11 `conforme_referentiel`,
5 `bloque` (M160-A2, M217-A4, M247-A2, M247-A7, M247-B3 : jamais affichées), **0 `valide_expert`**. Corrections : M217-A5, M247-A7, M160-A2, précisées après la revue Codex (détail dans le registre).

### Activation (aucune en production)

`VITE_QUIZ_MEMORISATION_PILOTE=true` au build d'une préproduction. Par défaut : absent → l'interface est inchangée.
Même actif, seules les questions de statut ≥ `conforme_referentiel` s'affichent, avec le bandeau « Pilote — questions
en cours de relecture médicale ». Hors pilote, seul `valide_expert` serait affichable (aucune question).

## 4. Tests et vérifications (réellement exécutés)

| Contrôle | Résultat |
|---|---|
| `tsc --noEmit` | 0 erreur |
| Suite complète `vitest run` | **1881 tests, 149 fichiers : tous passent** (dont 68 nouveaux, avec la non-régression de la revue scientifique) |
| ESLint sur les fichiers touchés, hors `prettier/prettier` | 0 erreur nouvelle (4 `any` et les erreurs de formatage existent déjà dans des fichiers non touchés, p. ex. `ednItemTabs.ts`) |
| `vite build` sans drapeau | OK ; **aucune question dans le bundle** : garde-fou `scripts/quiz-memorisation/verifier-bundle.mjs` vert |
| `vite build` avec drapeau | OK ; le garde-fou **échoue** comme attendu (questions détectées) |
| CI | nouvelle étape « Garde-fou du pilote « Mémoriser » » après le build de production : échoue si le drapeau est actif ou si une question est dans `dist` |
| `npm run build` (donc le Dockerfile de production) | enchaîne le même garde-fou : sans drapeau → OK ; avec drapeau → échec (vérifié) |
| Extraits du référentiel | 31/31 retrouvés mot pour mot dans `oic_competences` |
| Mobile (Chromium, 375 × 667, tactile) | aucun débordement horizontal, cibles ≥ 44 px, 0 erreur JS, parcours complet accueil → QCM → rappel → bilan |

Couverture des nouveaux tests : exactitude interne des données (4 options distinctes, réponse = option correcte,
positions de la bonne réponse variées, bonne réponse rarement la plus longue — un biais réel corrigé : 58 % des QCM),
longueurs adaptées au mobile, séries, notions à revoir, stockage corrompu / absent / bloqué, parcours complet,
rejeu des erreurs, visiteur sans compte, échec d'enregistrement, drapeau éteint (module jamais chargé), items hors
pilote, droits (lien absent si contenu verrouillé ou chargement en cours).

### Ce qui n'est PAS vérifié

- **Aucune relecture médicale humaine.** C'est le principal verrou. La revue du 15.10.2026 est une revue IA.
- Documents officiels complets (HAS, calendrier vaccinal 2025) non ouverts : domaines refusés par la politique
  réseau de l'environnement ; passages issus de moteurs de recherche.
- Aucun test avec de vrais étudiants : la pertinence pédagogique et le plaisir d'usage restent à mesurer.
- Pas d'E2E en production ni sur le vrai écran `/edn-complete/:slug/quiz` (le serveur de préproduction n'a pas accès
  à Supabase depuis l'environnement d'exécution) : la composition page + droits est testée par composants.
- Recoupements externes : résumés PubMed et extraits de recherche web ; le tableau HAS/vaccination n'a pas pu être
  rouvert. La persistance des notions à revoir est **locale à l'appareil** (la ligne `quiz_results` est, elle,
  enregistrée côté serveur).

## 5. Coût estimé d'une généralisation (ordres de grandeur, à confirmer sur un lot de 10 items)

Périmètre : 367 items × 6 à 8 questions ≈ **2 200 à 2 900 questions**.

| Poste | Estimation | Base |
|---|---|---|
| Rédaction + traçabilité (Sonnet) | ≈ 15 à 25 k tokens par item | lecture des compétences (13 en moyenne, ~1,4 k caractères) + 8 questions justifiées |
| Recoupement externe (poste dominant) | ≈ 20 à 40 k tokens par item | recherches PubMed/HAS ; dans le pilote, 20 questions sur 28 n'ont pas pu être recoupées par une source externe fiable |
| **Total IA** | **≈ 15 à 25 M tokens** pour 367 items | l'ensemble de cette mission (audit, code, tests, 28 questions) a consommé ≈ 0,4 M tokens |
| **Relecture médicale** | **≈ 75 à 100 h** (≈ 2 min par question) + reprises de 20 à 30 % | **coût principal et incompressible** |
| Ingénierie | ≈ 3 à 5 jours | table + RPC serveur soumise à la règle Gratuit/Premium, statut de validation, outil de relecture, persistance serveur des notions à revoir |

Le coût en tokens se multiplie par le tarif en vigueur ; il est faible devant la relecture humaine. Le pilote a aussi
fait remonter dans le référentiel officiel lui-même deux incohérences (dose d'insuline du coma hyperosmolaire, borne du seuil
glycémique) et plusieurs formulations débattues (§ registre) : prévoir un circuit de retour vers les éditeurs.

Préalable technique : les questions des items Premium ne doivent **pas** voyager dans le JavaScript en production
(lisibles par tous). Même schéma que `mm_contenu_immersif_item` : RPC qui renvoie `{verrouille:true}` hors item
d'essai ou abonnement.

## 6. Conditions d'une activation contrôlée (préproduction uniquement)

1. Relecture par un médecin des 23 questions affichables en pilote, et décision sur les 5 questions bloquées.
2. Confirmation de M160-A3/A4 sur le calendrier vaccinal 2025 complet, et de M247-A1 sur le document HAS complet.
3. Build de préproduction séparé : `VITE_QUIZ_MEMORISATION_PILOTE=true npx vite build` (jamais `npm run build`, qui
   refuse le drapeau), accès restreint aux testeurs (les questions Premium y sont lisibles dans le JavaScript).
4. Production : drapeau absent (le garde-fou de CI l'impose) ; seules des questions `valide_expert` servies par une
   RPC serveur pourront y être affichées.

## 7. Recommandation

**GO conditionnel — poursuivre en préproduction, pas de publication.**

1. **GO** : activer le drapeau sur une préproduction et faire relire par un médecin les **28 questions** ; faire
   tester 5 à 10 étudiants (fin de série, rappel des erreurs, ressenti « pas un examen »).
2. **GO ensuite** : étendre aux **10 items d'essai gratuits** (levier de conversion, aucune fuite de contenu Premium).
3. **NO-GO** pour la production et pour toute génération massive tant que : (a) la relecture médicale n'a pas
   donné `valide_expert` ; (b) la livraison serveur Gratuit/Premium n'existe pas ; (c) le pilote n'a pas montré un
   usage réel (aujourd'hui : 6 résultats de quiz en tout).
4. **À décider séparément, hors de ce travail** : neutraliser les 1101 + 734 gabarits (migration dédiée, après revue des
   20 fonctions listées), corriger les badges « Quiz » et la description SEO, signaler les erreurs du référentiel.
