# Musique — plan de comparaison A/B/C (préparé, NON exécuté)

> **Aucune génération n'a été lancée. Aucun appel à Suno n'a été fait.** Les six requêtes sont construites localement
> par le module de production ; les lancer consomme des crédits sunoapi.org et exige une autorisation explicite.

## 1. Question posée

Un prompt de style plus riche et structuré améliore-t-il l'accompagnement (problème A) et/ou la voix (problème B) par
rapport au prompt actuel ? La comparaison ne répond **pas** à « quel modèle est le meilleur » (un seul modèle) ni à la
fréquence des défauts (échantillon trop petit).

## 2. Variantes (mêmes paroles, même modèle)

| | Prompt de style | Négatifs | Origine |
|---|---|---|---|
| **A** | catalogue actuel (ex. Pop : `french pop, upbeat, bright synths, catchy chorus, 112 bpm, radio friendly`) | actuels | production aujourd'hui |
| **B** | « prompt personnel riche », mot pour mot | v2 | direction de référence de la propriétaire |
| **C** | prompt structuré v2 (genre → influences → instruments → groove → voix → tempo) | v2 | `mm-styles-v2.ts` |

Styles comparés d'abord : **Pop** (genre vocal `f`) et **Afrofusion** (slug `afrobeat`, genre vocal `m`) :
**6 requêtes**. Le genre vocal est arbitraire mais constant au sein d'un style. Les trois variantes d'un style partagent :
paroles (28 lignes de test dont 22 chantées, neutres, sans contenu médical, 808 caractères), titre, durée (139 s), modèle (`V6`, valeur du
code), `styleWeight` 0,70, `weirdnessConstraint` 0,30, `variety` 1, suffixes de voix et `french lyrics`.

Confusions connues, à garder en tête : A diffère de B et C par le prompt **et** par les négatifs (v1 contre v2, deux
tags « anti-robot » en plus) ; B et C diffèrent par la structure **et** par le tempo (C annonce un tempo, B non) et par
la recentration de l'afrofusion. L'écart A contre C mesure donc « ce qui serait livré » ; B contre C mesure le prompt.

Données : `docs/musique-comparaison-abc/requetes-abc.json` (charge utile complète de chaque requête, **sans clé**, `callBackUrl` fictive).
Régénération et contrôle : `bun scripts/musique/generer-requetes-abc.ts --ecrire` / `--verifier` ; le test
`src/tests/mmStylesV2.test.ts` vérifie que le fichier est à jour et ne contient aucun secret.

Longueurs (style / négatifs / paroles) : pop-A 109 / 94 / 808 ; pop-B 446 / 127 / 808 ; pop-C 275 / 127 / 808 ;
afrobeat-A 121 / 98 / 808 ; afrobeat-B 487 / 131 / 808 ; afrobeat-C 281 / 131 / 808 (limites 1 000 / 1 000 / 5 000).

## 3. Protocole de lancement (sur autorisation explicite seulement)

1. Confirmer la valeur de `SUNO_MODEL` en production (non lisible depuis l'environnement de préparation) et décider du
   modèle d'essai : le fichier utilise `V6`.
2. Relever le solde de crédits avant (fonction `suno-credits`, qui interroge le fournisseur) pour **mesurer** le coût.
3. Envoyer chaque `chargeUtile` à `POST https://api.sunoapi.org/api/v1/generate` avec la clé du secret serveur, en
   remplaçant `callBackUrl` par une adresse de rappel valable (ou en interrogeant `record-info`). Les six requêtes passent
   par un script jetable hors dépôt : aucun script de lancement n'est fourni ici, pour qu'aucun lancement n'ait lieu par
   erreur. Ne pas passer par `mm-generate-music` (il impose le catalogue actuel, le quota et le registre des tentatives).
4. Enregistrer l'identifiant de tâche de chacune des six requêtes et relever le solde après.
5. Copier immédiatement les fichiers audio (14 jours de conservation chez le fournisseur).
6. Écoute à l'aveugle : fichiers renommés (code aléatoire), ordre aléatoire par style, au moins deux auditeurs, casque
   puis haut-parleur de téléphone, même volume. Écouter **les deux pistes** de chaque requête (le code gère plusieurs
   pistes par génération) : la variance entre pistes est une information.
7. Remplir la grille (section 4), puis lever l'aveugle.
8. Comparer `tags` et `model_name` renvoyés par le rappel au `style` envoyé (ce que Suno déclare avoir retenu).

## 4. Grille d'évaluation (1 à 5 par critère, une grille par piste)

| Critère | 1 | 3 | 5 |
|---|---|---|---|
| **Réalisme vocal** | robotique, métallique, artefacts constants | quelques artefacts ou passages synthétiques | voix crédible, naturelle |
| **Richesse instrumentale** | boucle pauvre, peu d'instruments | accompagnement correct mais générique | arrangement varié, instruments reconnaissables |
| **Identité stylistique** | pourrait être un autre genre | genre reconnaissable, flou | genre immédiatement reconnaissable et cohérent |
| **Groove** | pulsation absente ou raide | pulsation correcte | groove marqué, naturel |
| **Dynamique** | plat du début à la fin | quelques variations | couplets, refrains et ruptures bien différenciés |
| **Intelligibilité du français** | plusieurs mots incompréhensibles | une phrase sur quatre perdue | tout est compréhensible ; transcription fidèle |
| **Qualité sonore globale** | sourd, saturé, bruité | acceptable | propre, équilibré |

Mesures complémentaires : paroles toutes chantées (oui/non), durée réelle contre 139 s, nombre de mots mal transcrits sur
une transcription des paroles chantées, commentaire libre (artefacts, moments à retenir).

Règle de décision (par style, à fixer avant l'écoute) : C est retenu si sa note moyenne sur *identité*, *richesse* et
*groove* est supérieure à celle de A d'au moins 0,5 point **et** que *réalisme vocal* et *intelligibilité* ne baissent pas
de plus de 0,5 point ; si B bat C nettement, le prompt de référence peut remplacer C pour ce style (c'est une donnée à
changer dans `mm-styles-v2.ts`, pas du code). Un écart inférieur à 0,5 point n'est pas une conclusion.

## 5. Limites

- Une requête par cellule (deux pistes) : aucune conclusion statistique ; l'essai révèle des tendances et des échecs
  flagrants. Pour confirmer un écart, répéter chaque cellule au moins trois fois avant de décider.
- Deux styles seulement ; le résultat ne se généralise pas aux 18 autres.
- Les notes sont subjectives ; l'aveugle limite le biais mais ne le supprime pas.

## 6. Coût

- **Non mesuré.** Le coût en crédits par génération et par modèle n'a pas pu être lu dans la documentation de
  sunoapi.org (accès refusé depuis l'environnement) et n'est pas consigné dans le dépôt.
- Estimation structurelle : **6 requêtes** (soit 6 × le coût d'une génération du modèle V6, chaque requête rendant
  plusieurs pistes), à multiplier par le nombre de répétitions retenu (3 répétitions : 18 requêtes). À mesurer en
  relevant le solde avant et après (étape 2 et 4 du protocole).
