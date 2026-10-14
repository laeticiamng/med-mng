# Musique — dossier « voix chantées »

> **Aucune promesse d'amélioration.** Ce dossier recense ce que la charge utile permet d'essayer, ce que la
> documentation du fournisseur dit (elle n'a **pas** pu être relue : « non vérifié en direct », voir
> `docs/MUSIQUE-CATALOGUE-STYLES-V2.md`) et ce que seule l'écoute peut trancher. Rien ici n'a été validé à l'oreille.

## 1. Le constat à traiter

« Voix artificielles ou métalliques » est un problème **distinct** de « accompagnements pauvres ». Il n'existe aucune
mesure, dans le dépôt, de la fréquence ni de la cause. Un prompt de style plus long ne le corrige pas par construction.

Ce que la chaîne MED MNG ne fait **pas** : aucun traitement audio (le MP3 est copié tel quel dans `mm-chansons`, les
lecteurs sont des lecteurs audio standards). Si la voix est métallique à la source, elle l'est dans le fichier Suno.
Premier contrôle à faire : écouter le même fichier brut (lien Suno temporaire) et la copie de la bibliothèque.

## 2. Leviers réellement disponibles dans la charge utile

| Levier | Où | Effet attendu | Statut |
|---|---|---|---|
| `vocalGender` (`m` / `f`) | panneau avancé → `vocalGender` | impose un timbre masculin ou féminin ; absent = Suno décide | transmis, effet sur le réalisme **non mesuré** |
| Descripteur de voix dans `style` | `clear male/female vocals` ajouté par le serveur + `voixRecommandee` du style v2 (ex. « warm natural lead vocals ») | oriente le timbre | hypothèse |
| Tag `french lyrics` | ajouté pour la langue `fr` | oriente la prononciation | transmis ; effet sur la prononciation **non mesuré** |
| Exclusions « anti-robot » | `negativeTags` v2 : `robotic vocals, metallic vocals` | éloigner un rendu synthétique | **hypothèse non démontrée** ; absentes d'électro, house, trap (le vocodeur y est un genre) |
| `styleWeight` | 0,70 par défaut (curseur) | adhérence au style : plus haut = suit davantage le prompt | sémantique à confirmer ; effet sur les voix inconnu |
| `weirdnessConstraint` | 0,30 par défaut (curseur) | écart créatif : plus haut = plus d'imprévu | idem ; une valeur haute pourrait dégrader le timbre (non vérifié) |
| `variety` | 1 par défaut, **jamais envoyé par l'interface** | non documenté dans le dépôt (entier 0–4) | testable seulement par un essai direct |
| Modèle | `SUNO_MODEL` : `V6` (défaut), `V6_WILD`, `V6_MINI`, `V4_5ALL` | les modèles diffèrent ; **les différences de qualité vocale ne sont documentées nulle part dans le dépôt** | non vérifié en direct |
| Paroles | `parolesChantees` (nombres et unités en lettres), balises `[Couplet]`/`[Refrain]` | une prononciation incorrecte (« 80 à 90 mg » transcrit « 80 à 86 mg », constat du 09.10) peut passer pour une voix artificielle | déjà traité pour les nombres |
| Durée | `duration` (90–360 s) : calculée sur la page Créer, choisie (120–300 s, défaut 240) sur la page item | une durée trop courte force un débit rapide et haché ; trop longue, des remplissages instrumentaux | transmis |
| Ambiance libre | champ « ambiance » (≤ 200 caractères, contrôlée) | l'utilisateur peut déjà ajouter des tags de voix (« breathy female vocals ») | déjà en production |

## 3. Pistes à tester (hypothèses, une variable à la fois)

1. **Descripteur de voix précis contre voix générique** : `warm natural lead vocals` contre `clear vocals` seul.
2. **Exclusions anti-robot** : avec contre sans `robotic vocals, metallic vocals`.
3. **Poids** : `styleWeight` 0,5 / 0,7 / 0,9 et `weirdnessConstraint` 0,1 / 0,3 / 0,5, à prompt constant.
4. **Modèle** : V6 contre V6_WILD contre V6_MINI, mêmes paroles et mêmes tags. Ce changement passe par le secret
   `SUNO_MODEL` : à ne faire qu'en essai, jamais en modifiant le défaut de production.
5. **Genre vocal** imposé contre libre.
6. **Prompt court contre riche** (déjà couvert par A/B/C) : vérifier surtout que la richesse instrumentale n'écrase pas
   la voix (voix plus en retrait, plus d'artefacts).
7. **Lignes de paroles** : vers plus courts et ponctuation simple, qui facilitent le placement des syllabes.

## 4. Ce qui ne peut pas être promis sans écoute

- Qu'un prompt plus riche, des exclusions ou un autre modèle améliorent le réalisme vocal.
- Qu'un genre vocal imposé soit plus naturel qu'un choix libre.
- Que « anti-robot » soit compris par le moteur comme on l'entend (un tag négatif n'est pas une garantie d'absence).
- Une voix réellement parlée (slam) : le moteur chante ou rappe plutôt qu'il ne parle.
- La prononciation des termes médicaux rares, quel que soit le style.
- La stabilité d'un essai à l'autre : une même requête donne des rendus différents (deux pistes par génération au
  moins) ; un seul essai ne prouve rien.

## 5. Mesures proposées lors de l'écoute

Grille du protocole (`docs/MUSIQUE-COMPARAISON-ABC.md`) : « réalisme vocal » et « intelligibilité du français » notés
séparément de l'instrumental, écoute à l'aveugle, au casque **et** sur haut-parleur de téléphone (les étudiants écoutent
sur téléphone), plus une transcription des paroles chantées pour mesurer l'intelligibilité (comme le contrôle du 09.10).
