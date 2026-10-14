# Musique — audit des paramètres et catalogue de 20 styles (v2)

> **Statut : préparé, testé localement, NON activé en production.**
> Le catalogue actif (13 styles, prompts actuels) est inchangé. `CATALOGUE_V2_ACTIF = false`.
> Aucun appel à Suno n'a été fait pour ce travail : aucune génération, aucun crédit consommé.

Fichiers : `supabase/functions/_shared/mm-styles-v2.ts` (catalogue v2 et bascule),
`src/tests/mmStylesV2.test.ts` (tests), `scripts/musique/` et `docs/musique-comparaison-abc/` (six requêtes
préparées), `docs/MUSIQUE-VOIX-CHANTEES.md`, `docs/MUSIQUE-COMPARAISON-ABC.md`.

## 1. Audit de la chaîne, du point de vue des paramètres

Chaîne : interface (`GeneratorForm`, `useAdvancedSunoParams`, `musicGenerationUtils.createRequestBody`) →
Edge Function `mm-generate-music` → `construireRequeteSuno` (`_shared/mm-suno-requete.ts`) →
`POST https://api.sunoapi.org/api/v1/generate` → rappel `mm-suno-callback` (ou rattrapage `mm-music-status`) →
copie de l'audio dans le compartiment `mm-chansons` → bibliothèque (`med_mng_songs`, `generated_music_tracks`).

### 1.1 Ce qui est RÉELLEMENT transmis au fournisseur (charge utile `ChargeUtileSuno`)

| Champ envoyé | Valeur | Origine |
|---|---|---|
| `customMode` / `instrumental` | `true` / `false` | constantes du serveur (le client ne choisit pas) |
| `model` | `SUNO_MODEL` si autorisé (`V6`, `V6_WILD`, `V6_MINI`, `V4_5ALL`), sinon **`V6`** | secret serveur ; le `model` du client est ignoré |
| `callBackUrl` | URL du rappel, signée et liée à l'utilisateur | `signerUrlRappel` |
| `lyrics` | paroles du rang, version « chantée » (nombres et unités en lettres), ≤ 5 000 caractères, coupées en fin de ligne | `parolesChantees` + `tronquerParoles` |
| `style` | prompt du style + ambiance libre éventuelle + `clear [male\|female] vocals` + `french lyrics` (si langue `fr`), ≤ 1 000 | `construireStyle` |
| `title` | `CODE · intitulé court — Rang X`, ≤ 80 | `construireTitre` |
| `negativeTags` | exclusions du style + exclusions de l'utilisateur, sans contradiction avec le prompt, ≤ 1 000 | `construireNegativeTags` |
| `vocalGender` | `m` ou `f` seulement si fourni ; sinon absent (Suno décide) | panneau avancé |
| `styleWeight` | **0,70** par défaut ; l'interface n'envoie que si le curseur ≠ 70 % | `POIDS_PAR_DEFAUT` |
| `weirdnessConstraint` | **0,30** par défaut ; idem (≠ 30 %) | `POIDS_PAR_DEFAUT` |
| `variety` | **1** ; le serveur accepte un entier 0–4 dans le corps, **mais aucun écran n'en envoie** (ni la page Créer ni la page item) | `POIDS_PAR_DEFAUT` |
| `duration` | **toujours envoyée**. **Page Créer (`/med-mng/create`)** : durée calculée, `max(lignes × 4,5 s ; mots ÷ 1,3) + 20 s`, bornée 90–360 s (sans durée, Suno rend 20 s). **Page item (flux EDN, `ParolesMusicalesControls` → `useParolesMusicales` → `useSunoMusicGeneration`)** : durée **choisie** par l'utilisateur, 120 / 180 / 240 / 300 s (défaut 240 s), ajoutée au corps ; le serveur la respecte (bornée 90–360 s) au lieu de la formule basée sur les paroles | `calculerDureeSecondes` |

### 1.2 Ce qui est ignoré ou jamais envoyé

- `prompt` : jamais envoyé (en mode custom, les paroles vont dans `lyrics`).
- Champs historiques du corps client, ignorés : `model`, `customMode`, `instrumental`, `fastMode`, `optimized`,
  `composition`, `personaId`, `audioWeight`. Aucune persona ni poids audio n'est donc transmis.
- Langue autre que `fr` : aucun tag de langue (seul `french lyrics` existe pour `fr`).
- Genre vocal « mixte » ou inconnu : `vocalGender` omis.
- Style inconnu ou ancien : remplacé par un alias connu, sinon par **`pop`** (journalisé côté serveur ; l'utilisateur
  n'est pas prévenu). Conséquence pour l'activation : le serveur doit connaître un nouveau slug **avant** que l'interface
  ne le propose.
- `variety` : non exposé côté interface. `duration` : non exposée sur la page Créer (durée calculée) mais exposée sur la page item (durée choisie 120–300 s, défaut 240 s).

### 1.3 Longueur réelle des prompts finaux et troncature

Mesures (voix `f`, langue `fr`, sans ambiance) :

| Version | Prompt seul | Style final envoyé |
|---|---|---|
| A — catalogue actuel (13 styles) | 72 à 125 caractères | 108 à 161 |
| B — « prompt personnel riche » (20 directions) | 349 à 453 | 385 à 489 |
| C — v2 structurée (20 styles) | 230 à 310 | 266 à 346 |

Limite du fournisseur : 1 000. Il n'y a **aucune troncature silencieuse des prompts actuels ni v2**. Où une troncature
peut exister :

1. **Style** : `joindreTags` coupe la **queue** de la liste quand elle dépasse 1 000. L'ambiance libre (≤ 12 tags de ≤ 40
   caractères, soit ≤ 504 caractères) est insérée *avant* la voix : en cas de dépassement, ce sont la voix
   (`clear … vocals`) puis `french lyrics` qui disparaîtraient en premier, sans message. Avec les prompts actuels (≤ 161),
   c'est impossible. Les prompts v2 sont bornés à 450 caractères : même avec l'ambiance maximale, rien n'est perdu
   (testé). Même les prompts B restent sous 1 000 (le plus long, afrobeat : 489 + 504 = 993), de justesse.
2. **Paroles** : coupées à 5 000 caractères en fin de ligne ; signalé (`parolesTronquees`, `lignesRetirees` dans les
   métadonnées et la réponse ; l'interface prépare la même coupe).
3. **`negativeTags`** : même mécanisme que le style (queue coupée) ; seules des exclusions utilisateur extrêmement longues
   seraient perdues.
4. **Durée** : plafonnée à 360 s. Des paroles qui demanderaient davantage ne seraient pas chantées en entier. Sur la page item, la durée choisie (120 à 300 s) prime sur la formule : une durée courte avec de longues paroles peut laisser des paroles non chantées (constat du 09.10 : 120 s pour 341 mots = 40 à 50 % chantés).
5. **Titre** : coupé sur un espace avec « … ».
6. Côté fournisseur : une éventuelle réécriture ou troncature interne n'est **pas observable** ici. Le rappel renvoie
   `tags` et `model_name` par piste, enregistrés dans `metadata` (`tags`, `model_name`) à côté du style envoyé
   (`stylePrompt`) : c'est le moyen de comparer ce qui a été envoyé à ce que Suno déclare avoir utilisé.

### 1.4 Aval du fournisseur

- Le rappel est signé, idempotent (task + type) ; `mm-music-status` rattrape un rappel perdu après 45 s.
- **Aucun traitement du signal audio** n'est fait par MED MNG : `copierAudioDansStockage` copie les octets du MP3 tels
  quels (limite 25 Mo), et les lecteurs utilisent un lecteur audio standard (`AudioContext` n'est utilisé que pour un
  bip de notification). Un son métallique ou pauvre vient donc du fournisseur (ou de l'écoute), pas de notre chaîne
  de stockage. À confirmer à l'oreille en comparant le fichier Suno brut et celui de la bibliothèque.
- Écart de documentation relevé : `docs/supabase-functions-flow.md` décrivait la durée « lignes × 4,5 s + 15 s, bornée
  90–300 s » ; le code fait deux chemins : durée fournie par le client si valide (page item, 120–300 s), bornée 90–360 s ; sinon `max(lignes × 4,5 ; mots ÷ 1,3) + 20`, bornée 90–360 (corrigé dans ce même PR).

### 1.5 Deux problèmes distincts, à ne pas confondre

- **A. Accompagnements pauvres ou génériques.** Ce que le code laisse tester : prompt plus ou moins riche (A/B/C),
  ambiance libre (déjà proposée aux utilisateurs), `styleWeight`, `weirdnessConstraint`, modèle (`SUNO_MODEL`), durée.
  Les prompts actuels ne comptent que 6 à 8 tags et contiennent des mots peu instrumentaux (« radio friendly »,
  « educational »). C'est une hypothèse de cause, pas un fait mesuré.
- **B. Voix artificielles ou métalliques.** Leviers : `vocalGender`, descripteur de voix, exclusions « anti-robot »,
  poids, modèle (voir `docs/MUSIQUE-VOIX-CHANTEES.md`). Un prompt plus long ne règle pas ce problème par construction ;
  il pourrait même diluer la consigne de voix.

**Aucune amélioration n'est promise sans écoute** : la v2 est une hypothèse structurée, évaluée par le protocole A/B/C.

## 2. Documentation sunoapi.org : non vérifié en direct

Tentatives : `curl https://docs.sunoapi.org/...` → `CONNECT tunnel failed, response 403` (le proxy de l'environnement
refuse l'hôte) ; `WebFetch` → `getaddrinfo ENOTFOUND docs.sunoapi.org`. La restriction n'a pas été contournée.

En conséquence, **non vérifié en direct** : modèles disponibles autres que ceux du code (V5, V4_5…), limites par modèle,
coûts en crédits par génération et par modèle, différences de qualité vocale ou instrumentale entre modèles, nombre de
pistes par requête, sémantique exacte de `variety`, `styleWeight` et `weirdnessConstraint`.

Ce que le dépôt contient (documentation lue le 25/09/2026 par l'auteur du module, citée dans son en-tête, non revérifiée
ici) : modèles `V6` (défaut), `V6_WILD`, `V6_MINI`, `V4_5ALL` (déprécié mais accepté) ; mode custom avec `lyrics`
≤ 5 000 en V6 ; `style` ≤ 1 000 ; `title` ≤ 80 ; `negativeTags` ≤ 1 000 ; `vocalGender` m/f ; `styleWeight` et
`weirdnessConstraint` 0–1 ; `variety` 0–4 ; `duration` 10–360 s (20 s si absente) ; fichiers conservés 14 jours.
Le fait que les paroles soient bien chantées via `lyrics` est confirmé par les chansons de production transcrites le
09.10.2026. **Coût en crédits : non mesuré.**

Modèle configuré dans le code : `V6` par défaut (`MODELE_SUNO_DEFAUT`), surchargeable par le secret `SUNO_MODEL`. La valeur
du secret en production n'est pas lisible depuis cet environnement.

## 3. Catalogue v2 : 20 styles

Structure `StyleMusicalV2` (étend `StyleMusical`) : `slug`, `libelle`, `description`, `prompt` (anglais, composé),
`negativeTags`, `energie`, plus `genrePrincipal`, `influences`, `instrumentsDominants`, `instrumentsSecondaires`,
`groove`, `voixRecommandee`, `tempoBpm`, `vocalGenderConseille` (aucun conseil établi : vide pour les 20),
`promptReference` (direction B, mot pour mot), `noteReference`, `tagsIncompatibles`, `recommandation`, `proches`.

Les 13 slugs actuels sont conservés **à l'identique, dans le même ordre**, avec le même libellé, la même description,
la même énergie et le même tempo ; seuls prompt (structuré) et exclusions (actuelles **+ ajouts**) changent. Les prompts
actuels restent la version active (retour arrière). Un prompt v2 = `genre principal, influences, instruments dominants,
instruments secondaires, groove, voix, tempo` (≤ 450 caractères, 10 à 18 tags). Les exclusions ajoutent
`robotic vocals, metallic vocals` (hypothèse anti-robot, non démontrée), sauf pour électro, house et trap où un vocodeur
fait partie du genre.

### 3.1 Cohérence des directions de référence (B)

Tensions relevées et résolues dans la version C :

- **Rap** : boom bap (côte Est, grain poussiéreux) + influences West Coast + « polished » : deux directions ; retirés.
- **Lo-fi** : lo-fi, jazzhop, chillhop et « mellow neo-soul » sont quasi synonymes ; « spacious » s'oppose à l'intimité lo-fi ;
  « neo-soul » retiré pour ne pas empiéter sur le style neo-soul.
- **Afrofusion** : Amapiano, Afrokompa, Afrozouk, Makossa, Bikutsi, Afrosoul, Afro-Caribbean dans un seul prompt : **risque de
  style flou** (log drums amapiano et guitares kompa n'ont ni le même tempo ni le même balancement). C est **recentrée** sur
  afrobeats / afrofusion ; amapiano et zouk-kompa deviennent des styles à part.
- **Comptine** : « sophisticated nursery rhyme » est un oxymore ; « nursery rhyme » seul est gardé.
- **Slam** : « cinematic transitions » contre « restrained » ; surtout, Suno chante ou rappe plus qu'il ne parle :
  une voix réellement parlée ne peut pas être promise.
- **House** : « organic » contre « four-on-the-floor » électronique ; retiré.
- **Zouk-kompa** : « Afrokompa, Afrozouk » ramène vers l'afrobeat ; préfixe « afro » retiré.
- **Reggaeton** : paroles françaises sur un style latin, la prononciation peut glisser ; à écouter.
- Jazz : solos étendus contre paroles à chanter en entier ; à surveiller.

### 3.2 Les 7 nouveaux styles et leurs voisins

Similarité lexicale (Jaccard des mots significatifs, 0–1 ; mesure grossière, jugement musical en plus) : C = prompts v2,
B = directions de référence.

| Paire | C | B | Verdict |
|---|---|---|---|
| rnb / **neo-soul** | 0,21 | **0,58** | **Quasi identiques** (Rhodes, basse, batterie « pocket », voix intime, groove relaxé). **Ne pas activer** neo-soul (proche aussi du lo-fi). |
| rap-francais / **trap** | 0,29 | 0,45 | Sonorité distincte (808, charleys, demi-temps) mais même usage que le rap : **à évaluer**, priorité basse. |
| afrobeat / **amapiano** | 0,19 | 0,41 | Distincts (log drums, pulsation house à 112) **si** l'afrobeat est recentré : **recommandé**. |
| afrobeat / **zouk-kompa** | 0,20 | 0,28 | Distincts (guitares claires caribéennes, batterie live) **sans** préfixe « afro » : **recommandé**. |
| pop / electro | 0,20 | 0,32 | Proches en v1 (« bright synths » / « pulsing synths »). En v2 : pop menée par instruments live, électropop menée par synthés. |
| electro / **house** | 0,16 | 0,34 | Voisins (synthés analogiques, breakdowns) : **à évaluer** après écoute. |
| reggae / **reggaeton** | < 0,16 | — | Distincts (dembow contre offbeat) : **recommandé**. |
| rnb / **funk** | < 0,16 | — | Distincts (slap, clavinet, cuivres) : **recommandé**. |

Recommandés à l'activation (sur le seul critère de distinction ; la qualité sonore n'est pas évaluée) : **amapiano,
zouk-kompa, reggaeton, funk**. À évaluer : **trap, house**. Déconseillé : **neo-soul**.
Aucun des 20 styles n'a de `vocalGenderConseille` : rien ne l'établit sans écoute.

### 3.3 Tableau des 20 styles (prompt v2, tempo, longueur)

Les prompts complets se lisent dans `mm-styles-v2.ts` et dans `docs/musique-comparaison-abc/requetes-abc.json` (Pop et
afrobeat). Genres principaux : rap-francais « french conscious hip hop » (92), pop « french melodic pop » (112), lofi
« lo-fi hip hop » (80), chanson-francaise « contemporary french chanson » (100), afrobeat « afrobeats » (104), rock
« modern melodic rock » (128), jazz « contemporary vocal jazz » (110), reggae « modern roots reggae » (76), electro
« modern electropop » (120), rnb « contemporary r&b » (90), acoustique « contemporary acoustic folk » (96), comptine
« playful acoustic pop » (100), slam « french spoken word » (84), trap « modern melodic trap » (140), neo-soul
« contemporary neo soul » (86), amapiano « soulful amapiano » (112), zouk-kompa « modern kompa zouk » (100), house
« melodic house » (122), reggaeton « modern melodic reggaeton » (96), funk « modern funk » (108).

## 4. Point de bascule unique

```ts
CATALOGUE_V2_ACTIF = false
obtenirCatalogueActif(v2Actif = CATALOGUE_V2_ACTIF)   // false → STYLES_MUSICAUX (même référence)
resoudreStyleActif(slug, v2Actif = CATALOGUE_V2_ACTIF) // false → exactement resoudreStyle ; true → v2, repli « pop »
```

Rien dans `src/` ni dans `supabase/functions/` n'importe ce module (testé). La sélection d'un slug inconnu retombe sur
le comportement actuel (`pop`).

## 5. Activation (NON faite) : conditions et étapes

Pré-requis : écoute A/B/C (`docs/MUSIQUE-COMPARAISON-ABC.md`), décision explicite de la propriétaire.

1. Fixer les prompts retenus (v2 ou référence) dans `mm-styles-v2.ts`.
2. `construireRequeteSuno` résout le style en interne avec le catalogue actuel : ajouter une entrée optionnelle
   `styleResolu` et la fournir depuis `mm-generate-music` avec `resoudreStyleActif` (le module v2 importe le module de
   requête : l'inverse créerait un cycle).
3. Front : `src/config/stylesMusicaux.ts` doit servir `obtenirCatalogueActif()` ; ajouter les genres des nouveaux slugs
   dans `MusicStylesData.ts` ; adapter le sélecteur à 19 styles (coordination avec la PR interface) ; le test actuel
   « entre 10 et 14 styles » devra être réécrit.
4. Alias : `neo-soul` et `funk` sont aujourd'hui des alias de `rnb` ; à l'activation `funk` devient un style propre
   (préférences enregistrées modifiées) ; `neo-soul` reste alias de `rnb` tant qu'il n'est pas activable.
5. **Ordre de déploiement** : Edge Function `mm-generate-music` d'abord, publication du site ensuite (sinon un slug
   inconnu du serveur retombe sur `pop`).
6. Retour arrière : repasser le drapeau à `false` et redéployer.

Cette PR ne change ni le parcours de génération, ni les quotas, ni les garde-fous financiers, ni l'interface : **aucun
déploiement d'Edge Function ni publication du site n'est nécessaire**.
