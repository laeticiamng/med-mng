# Registre de vérification — questions de mémorisation (pilote)

Mis à jour le 15.10.2026 (revue scientifique ciblée, 2ᵉ passe). Source de vérité des données : `src/data/quizMemorisation/ic-*.ts`
(le tableau ci-dessous en est extrait ; en cas d'écart, les fichiers de données font foi).

## Ce que « vérifié » veut dire ici

| Statut | Signification | Affichable |
|---|---|---|
| `brouillon` | Jamais affichée. | non |
| `conforme_referentiel` | Fidèle au texte officiel : l'extrait cité est retrouvé **mot pour mot** dans `oic_competences`. Pas recoupée par une source externe. | pilote seulement |
| `verifie_source_externe` | Idem, **et** recoupée par au moins une source externe citée (PubMed, HAS). | pilote seulement |
| `valide_expert` | Relue et validée par un médecin. | **production** |
| `bloque` | Point scientifique non tranché ; raison dans `motifBlocage`. | **jamais** |

**Aucune des 28 questions n'est `valide_expert`.** Répartition : 11 `verifie_source_externe`,
11 `conforme_referentiel`, 6 `bloque` (M160-A2, M217-A4, M217-B3, M247-A2, M247-A7, M247-B3). 22 questions seulement sont affichables en pilote. Les questions `verifie_source_externe` ont été
recoupées par une IA (Claude) sur les résumés PubMed, ou sur un extrait de recherche web pour la HAS
(document non rouvert) : c'est un recoupement documentaire, pas une validation médicale. Un test
(`donnees.test.ts`) interdit qu'une question porte `valide_expert` ou `brouillon` dans le pilote, et
vérifie qu'**aucune** question n'est affichable en production.

## Contrôle de l'extrait du référentiel (exécuté le 15.10.2026)

31 passages (28 questions) recherchés dans `oic_competences.description` (espaces normalisés) :
**31/31 retrouvés mot pour mot.** Pour le rejouer (lecture seule) :

```bash
QMEMO_SQL_OUT=/tmp/verif.sql npx vitest run src/data/quizMemorisation   # écrit la requête
# puis exécuter /tmp/verif.sql dans l'éditeur SQL Supabase : la colonne « trouve » doit être vraie partout.
```

## Les 28 questions

| ID | Type | Compétence | Statut | Réponse correcte | Sources externes | Réserves / blocage |
|---|---|---|---|---|---|---|
| M160-A1 | QCM | OIC-160-04-A | `conforme_referentiel` | Un trismus | — | — |
| M160-A2 | Rappel | OIC-160-04-A | `bloque` | Contraction généralisée, descendante, spasmes douloureux, dysautonomie | — | **BLOQUÉE** : La réponse et l’explication s’écartent du référentiel (« sans fièvre » sur toute l’évolution) : apyrexie limitée au début et « spasmes douloureux » repris de OIC-160-01-B, d’après des sources externes (CDC Pink Book, revue PMC7617864) non ouvertes depuis l’environnement. À recouper sur ces sources puis reclasser en verifie_source_externe, ou revenir au texte du référentiel.<br>Le référentiel écrit « sans fièvre » pour toute l’évolution. Revue du 15.10.2026 puis revue Codex : l’apyrexie est réservée au début (une fièvre peut apparaître avec la dysautonomie, selon les sources citées par Codex : CDC Pink Book, revue PMC7617864, non ouvertes ici) ; « spasmes douloureux » vient de OIC-160-01-B. Pas de source externe retrouvée dans la recherche du 15.10.2026 (requête PubMed sans résultat) : à recouper lors de la relecture médicale. |
| M160-A3 | QCM | OIC-160-03-A | `verifie_source_externe` | Immunoglobulines tétaniques 250 UI dans un bras, vaccin dans l’autre | [Avis du HCSP (mai 2013), tableau « Conduite à tenir immédiate en cas de plaie », repris par Vaccination Info Service et mesvaccins.net](https://vaccination-info-service.fr/content/download/1343/14681/version/1/file/TABLEAU_tetanos_Conduite+a%CC%80+tenir.pdf) | Concordant entre le référentiel et l’avis HCSP 2013, toujours cité comme référence par les sources récentes consultées. Le calendrier vaccinal 2025 complet n’a pas pu être ouvert (domaine bloqué) : à confirmer sur le document officiel lors de la relecture médicale. |
| M160-A4 | QCM | OIC-160-03-A | `verifie_source_externe` | Une dose de vaccin contenant la valence tétanique | [Avis du HCSP (mai 2013), tableau « Conduite à tenir immédiate en cas de plaie », repris par Vaccination Info Service et mesvaccins.net](https://vaccination-info-service.fr/content/download/1343/14681/version/1/file/TABLEAU_tetanos_Conduite+a%CC%80+tenir.pdf) | Même réserve que M160-A3 (calendrier vaccinal 2025 complet non ouvert). |
| M160-A5 | QCM | OIC-160-03-A | `conforme_referentiel` | Un ulcère de jambe d’origine vasculaire | — | — |
| M160-A6 | Rappel | OIC-160-03-A | `conforme_referentiel` | Bactérie ubiquitaire des sols | — | — |
| M160-B1 | QCM | OIC-160-01-B | `verifie_source_externe` | Les interneurones inhibiteurs | [Connan & Popoff, Curr Top Microbiol Immunol 2017 (PubMed 28879524)](https://doi.org/10.1007/82_2017_50)<br>[Surana et al., Toxicon 2017 (PubMed 29031941)](https://doi.org/10.1016/j.toxicon.2017.10.008) | — |
| M160-B2 | Rappel | OIC-160-01-B | `verifie_source_externe` | Sang → transport rétrograde (motoneurones) → relais synaptique médullaire → interneurones inhibiteurs | [Connan & Popoff, Curr Top Microbiol Immunol 2017 (PubMed 28879524)](https://doi.org/10.1007/82_2017_50)<br>[Surana et al., Toxicon 2017 (PubMed 29031941)](https://doi.org/10.1016/j.toxicon.2017.10.008) | Revérifié à la clôture technique, aucune erreur établie, réponse inchangée : la toxine est captée par les motoneurones (jonction neuromusculaire), transportée de façon rétrograde jusqu’aux motoneurones médullaires ou du tronc cérébral, puis transcytosée vers les interneurones inhibiteurs où elle bloque la libération de neurotransmetteurs (PubMed 29031941 et 28879524). Le passage sanguin vient du référentiel ; il est compatible (la toxine gagne la jonction neuromusculaire par voie lymphatique ou sanguine). |
| M217-A1 | QCM | OIC-217-01-A | `conforme_referentiel` | Plus de 50 % d’éléments mononucléés, avec au moins 10 % de lymphocytes activés | — | Un support de cours (Pilly étudiant ECN 2020, item 217, extrait de recherche web) donne « plus de 10 % » de lymphocytes activés : la borne (≥ ou >) varie selon les sources, la question ne repose pas dessus. |
| M217-A2 | QCM | OIC-217-05-A | `conforme_referentiel` | La primo-infection à EBV | — | Pourcentages (80 % / 10 %) non recoupés par une source externe. |
| M217-A3 | QCM | OIC-217-05-A | `verifie_source_externe` | Les aminopénicillines | [Chovel-Sella et al., Pediatrics 2013 (PubMed 23589810)](https://doi.org/10.1542/peds.2012-1575) | — |
| M217-A4 | Rappel | OIC-217-05-A | `bloque` | Cytolyse hépatique, habituellement sans cholestase | — | **BLOQUÉE** : La réponse « habituellement sans cholestase » qualifie le référentiel (« sans cholestase associée ») d’après une revue externe (PMC3660095) non ouverte depuis l’environnement. À recouper sur cette source puis reclasser en verifie_source_externe, ou revenir au texte du référentiel.<br>Revue Codex (42b97ab) : le référentiel écrit « sans cholestase associée » ; une cholestase survient dans une minorité de cas d’EBV (revue PMC3660095 citée par Codex, non ouverte) : formulation qualifiée (« habituellement », « le plus souvent »). |
| M217-A5 | QCM | OIC-217-05-A | `verifie_source_externe` | Une sérologie EBV | [Sylvester et al., « Infectious Mononucleosis: Rapid Evidence Review », Am Fam Physician 2023 (PubMed 36689975)](https://pubmed.ncbi.nlm.nih.gov/36689975/)<br>[CDC, « Laboratory Testing for Epstein-Barr Virus (EBV) » (2024)](https://www.cdc.gov/epstein-barr/php/laboratories/)<br>[Field & Dwyer, Pathology 1996 (PubMed 8912361)](https://doi.org/10.1080/00313029600169144) | Relecture Codex (a00f3fe) : le profil sérologique (IgM anti-VCA positives, anti-EBNA négatifs, délai de 2 à 4 mois) et la phrase sur les IgG anti-VCA ont été retirés, faute de source lue (page CDC non ouverte) ; l’explication ne contient plus que ce que couvrent les sources PubMed 36689975 et 8912361. Précisée une 3ᵉ fois (clôture technique) : la question distingue test hétérophile (non spécifique) et sérologie EBV spécifique, et vise le cas typique du MNI test négatif chez l’enfant (source CDC ajoutée). CORRIGÉ deux fois le 15.10.2026 : (1) revue scientifique — la version initiale reprenait « diagnostic de certitude : MNI test », formulation du référentiel qui surestime un test de dépistage ; (2) revue Codex — « MNI test » restait dans la réponse « confirmatoire » : la question porte désormais sur la sérologie EBV après un MNI test négatif ou douteux. Le point « PCR EBV sans indication chez l’immunocompétent » n’est toujours pas utilisé (non retrouvé en source externe). |
| M217-A6 | QCM | OIC-217-04-A | `conforme_referentiel` | Un contact avec un chat ou de la viande crue | — | — |
| M217-B1 | QCM | OIC-217-02-B | `conforme_referentiel` | De grands lymphocytes T activés hyperbasophiles, sans blaste | — | — |
| M217-B2 | Rappel | OIC-217-06-B | `verifie_source_externe` | Antibiotiques (sulfamides, bêta-lactamines), anticonvulsivants, allopurinol | [Ramirez et al., Microorganisms 2023 (PubMed 36838310)](https://doi.org/10.3390/microorganisms11020346) | Les bêta-lactamines ne figurent pas dans le résumé de la source externe : à recouper. |
| M217-B3 | QCM | OIC-217-06-B | `bloque` | Une hyperéosinophilie | [Ramirez et al., Microorganisms 2023 (PubMed 36838310)](https://doi.org/10.3390/microorganisms11020346) | **BLOQUÉE** : L’explication affirme que l’atteinte hépatique du DRESS peut être cytolytique, cholestatique ou mixte : ce point ne figure ni dans l’extrait du référentiel ni dans la source citée (PubMed 36838310, médicaments en cause) ; sa source (revue PMC6448072, indiquée par la revue Codex) n’a pas pu être ouverte. À lire et citer, puis reclasser en verifie_source_externe ; ou revenir à une explication limitée à l’hyperéosinophilie.<br>Revue Codex (82a6c1a) : la mention « sans cholestase » (spécifique à l’EBV dans le référentiel) est retirée du DRESS, dont l’atteinte hépatique peut être cytolytique, cholestatique ou mixte (revue PMC6448072 citée par Codex, non ouverte). |
| M247-A1 | QCM | OIC-247-03-A | `verifie_source_externe` | ≥ 1,26 g/L | [HAS, « Principes de dépistage du diabète de type 2 »](https://www.has-sante.fr/jcms/c_464100/fr/principes-de-depistage-du-diabete-de-type-2)<br>[HAS, « Parcours de soins du patient adulte vivant avec un diabète de type 2](https://www.has-sante.fr/upload/docs/application/pdf/2025-07/parcours_de_soins_du_patient_adulte_vivant_avec_un_diabete_de_type_2_-_14_messages_cles_pour_ameliorer_votre_pratique.pdf) | La compétence 247-04-A écrit « > 1.26 » alors que 247-03-A écrit « ≥ 1,26 » : la question suit 247-03-A et 247-01-A (« supérieure à 1,26 g/l »). Divergence à signaler aux éditeurs du référentiel. |
| M247-A2 | QCM | OIC-247-03-A | `bloque` | Glycémie à jeun entre 1,10 et 1,26 g/L | — | **BLOQUÉE** : Conflit de sources non tranché : le référentiel indique l’HGPO pour une glycémie à jeun entre 1,10 et 1,26 g/L, alors que la HAS (« Principes de dépistage du diabète de type 2 ») indique que l’HGPO n’est pas recommandée pour poser le diagnostic de diabète, le test recommandé étant la glycémie veineuse à jeun. À trancher par le relecteur médical (reformuler, ou retirer).<br>Bloquée le 15.10.2026 (revue scientifique) ; voir motifBlocage. |
| M247-A3 | Rappel | OIC-247-03-A | `conforme_referentiel` | ≥ 2 g/L (11,1 mmol/L) | — | Seuil international (OMS) repris par le référentiel. La HAS ne recommande pas l’HGPO pour le diagnostic hors grossesse : la question porte sur la valeur du seuil, pas sur l’indication (voir M247-A2, bloquée). Aucun document primaire ouvert. |
| M247-A4 | QCM | OIC-247-02-A | `conforme_referentiel` | Début rapide, hyperglycémie > 3 g/L, cétose souvent présente | — | Profil « typique » : des formes atypiques existent (la HAS demande un avis spécialisé si présentation inhabituelle). |
| M247-A5 | Rappel | OIC-247-02-A | `conforme_referentiel` | Les maladies cardiovasculaires | — | Aucune source externe fiable retrouvée par la requête PubMed du 15.10.2026 (un résultat non pertinent a été écarté). |
| M247-A6 | QCM | OIC-247-25-A | `verifie_source_externe` | Le resucrage par la bouche | [HAS, Commission de la transparence, avis BAQSIMI (glucagon nasal), CT-18963](https://www.has-sante.fr/upload/docs/evamed/CT-18963_BAQSIMI_PIC_INS_AvisDef_CT18963.pdf) | — |
| M247-A7 | Rappel | OIC-247-25-A | `bloque` | 15 g de sucre : environ 3 morceaux, ou un demi-verre de soda ou de jus non allégé | — | **BLOQUÉE** : La réponse « demi-verre (≈ 150 mL) de soda ou de jus non allégé » et le retrait des bonbons viennent d’une synthèse HAS 2025 (citée par la revue Codex) et d’une fiche suisse, non ouvertes depuis l’environnement, et non du référentiel (« 15 g = 3 morceaux, ou soda ou bonbons »). À recouper sur la synthèse HAS puis reclasser en verifie_source_externe, ou revenir au texte du référentiel.<br>CORRIGÉ le 15.10.2026 (revue scientifique) : « soda » sans précision laissait passer un soda light, sans sucre ; « 3 morceaux » devient « environ 3 morceaux » (le nombre de morceaux pour 15 g dépend de leur taille : une fiche suisse indique 4 morceaux). Le repère de 15 g est concordant dans les fiches consultées (règle « 15-15 »). Revue Codex : chaque alternative est désormais quantifiée (demi-verre de soda ou de jus non allégé, ≈ 150 mL, concordant avec la fiche suisse « 1,5 dl ») ; « des bonbons », non quantifiable, est retiré. À confirmer sur la synthèse HAS 2025 citée par Codex (10 à 20 g, demi-verre), non ouvrable depuis l’environnement. |
| M247-A8 | QCM | OIC-247-25-A | `conforme_referentiel` | Un sulfamide hypoglycémiant | — | Formulation « source classique » choisie pour ne pas affirmer qu’aucun autre traitement ne peut contribuer à une hypoglycémie. |
| M247-B1 | QCM | OIC-247-08-B | `verifie_source_externe` | Anti-GAD | [Thomas et al., Diabetes Care 2023 (PubMed 36802355)](https://doi.org/10.2337/dc22-2159) | — |
| M247-B2 | Rappel | OIC-247-09-B | `verifie_source_externe` | Insulinorésistance + altération de l’insulinosécrétion | [Galicia-Garcia et al., Int J Mol Sci 2020 (PubMed 32872570)](https://doi.org/10.3390/ijms21176275) | — |
| M247-B3 | QCM | OIC-247-29-B | `bloque` | NaCl 0,9 % ou cristalloïde équilibré, selon le contexte | [Umpierrez et al., « Hyperglycemic Crises in Adults With Diabetes: A Consensus Report » (ADA/EASD/JBDS/AACE/DTS), Diabetes Care 2024 (PubMed 39052901)](https://doi.org/10.2337/dci24-0032) | **BLOQUÉE** : La réponse « NaCl 0,9 % ou cristalloïde équilibré » repose sur le consensus ADA/EASD 2024 (fourni par la revue documentaire et confirmé par la revue Codex, avec une réserve cardiaque ou rénale), mais le chapitre sur les fluides n’a pas pu être lu : seul le résumé PubMed est accessible, le texte complet (PMC11272983) est bloqué depuis l’environnement. À vérifier sur le texte complet, puis reclasser en verifie_source_externe (en précisant la condition) ou revenir à une réponse limitée au NaCl 0,9 % du référentiel.<br>Le reste de la compétence (débit d’insuline, seuil de kaliémie) n’est volontairement pas interrogé : à recouper avant tout usage. Clôture technique : le référentiel ne cite que le sérum salé 0,9 % ; la réponse reconnaît aussi les cristalloïdes équilibrés (consensus ADA/EASD 2024, indiqué par la revue documentaire ; texte complet non ouvert). Revue Codex (bf15a33) : la nouvelle alternative ne vient pas du référentiel, donc le statut conforme_referentiel ne la couvrait pas ; question bloquée tant que le passage n’est pas lu. |

## Revue scientifique ciblée du 15.10.2026 (2ᵉ passe)

Revue IA (Claude), indépendante de la rédaction initiale, sur les 28 questions : réponses, distracteurs,
explications, chiffres, seuils, posologies, formulations absolues. **Ce n'est pas une validation médicale.**

Limite d'accès : la politique réseau de l'environnement refuse `has-sante.fr`, `sante.gouv.fr`,
`vaccination-info-service.fr`, `infectiologie.com`, `sfdiabete.org`. Les documents officiels complets n'ont
pas pu être ouverts ; les passages cités viennent de moteurs de recherche, et les sources scientifiques
de PubMed. Chaque note le précise.

| Question | Constat | Décision |
|---|---|---|
| **M217-A5** | « Diagnostic de certitude : MNI test » surestime un test de dépistage : sensibilité 87 %, faux négatifs chez l'enfant de moins de 5 ans et la première semaine (Am Fam Physician 2023, PubMed 36689975) ; « à n'utiliser que pour le dépistage », sensibilité < 50 % chez l'enfant (Pathology 1996, PubMed 8912361). | **Corrigée** (puis précisée après revue Codex) : « MNI test négatif ou douteux : quel examen demander ? » → « Une sérologie EBV » ; l'explication dit que le MNI test oriente mais ne confirme pas. |
| **M247-A2** | Le référentiel indique l'HGPO pour une glycémie à jeun de 1,10 à 1,26 g/L ; la HAS indique que l'HGPO n'est pas recommandée pour diagnostiquer un diabète (test recommandé : glycémie veineuse à jeun). | **Bloquée** : conflit à trancher par le relecteur médical. |
| **M247-A7** | « soda » sans précision : un soda light ne resucre pas. « 3 morceaux » dépend de la taille du morceau (4 selon une fiche suisse). | **Corrigée** (puis précisée après revue Codex) : « environ 3 morceaux, ou un demi-verre (≈ 150 mL) de soda ou de jus non allégé » ; « des bonbons », non quantifiable, retiré. |
| **M160-A2** | « sans fièvre » : formulation absolue (la dysautonomie peut perturber la thermorégulation). | **Corrigée** (puis précisée après revue Codex) : la réponse ne parle plus de fièvre ; l'explication réserve l'apyrexie au début (une fièvre peut apparaître avec la dysautonomie). |
| M247-A1 | Seuil ≥ 1,26 g/L à deux reprises : concordant HAS. | Confirmée (`verifie_source_externe`). |
| M247-A3 | Seuil HGPO 2 h ≥ 2 g/L : seuil exact ; l'indication est traitée par M247-A2. | Confirmée sur le seuil (`conforme_referentiel`). |
| M247-A6 | Pas de voie orale chez le patient inconscient ; glucagon recommandé (HAS, avis BAQSIMI, reprenant ADA/AACE/ISPAD). | Confirmée (`verifie_source_externe`). |
| M247-A8 | Sulfamides, glinides, insuline : sources classiques d'hypoglycémie. | Confirmée sur le référentiel. |
| M160-A3, M160-A4 | Tableau plaie × statut vaccinal (HCSP 2013), immunoglobuline 250 UI réservée à la plaie majeure ou tellurique chez le non-à-jour : concordant. Calendrier 2025 complet non ouvert. | Confirmées (`verifie_source_externe`), confirmation sur le calendrier 2025 à faire en relecture. |
| Les 20 autres | Aucune erreur établie relevée. | Inchangées. |

### Revue Codex (commit 97272ff) — 4 remarques, toutes retenues

| Remarque | Traitement |
|---|---|
| P1 — le garde-fou ne couvrait que le `dist` de la CI, pas l'image Docker de production | `npm run build` enchaîne désormais le garde-fou : le Dockerfile (qui appelle `npm run build`) échoue si le drapeau est actif ou si une question est dans `dist`. Fichiers `.env`, `.env.local`, `.env.production(.local)` contrôlés. |
| P2 — M217-A5 laissait le MNI test dans la réponse « confirmatoire » | Question reformulée (voir ci-dessus). |
| P2 — M247-A7 : soda et bonbons non quantifiés | Alternatives quantifiées, bonbons retirés. |
| P2 — M160-A2 : « classiquement sans fièvre » sur toute l'évolution | Apyrexie limitée au début. |

### Clôture technique (revue documentaire complémentaire)

| Question | Décision |
|---|---|
| M217-A5 | Précisée : distingue le test hétérophile (non spécifique de l'EBV, faux négatifs chez l'enfant) de la sérologie EBV spécifique (IgM anti-VCA, anti-EBNA). Source CDC ajoutée (extrait de recherche, page non ouverte). Statut `verifie_source_externe`. |
| M247-A3 | Seuil précisé : 2 g/L = **11,1 mmol/L** (le référentiel arrondit à 11). |
| M247-B3 | La réponse reconnaît « NaCl 0,9 % ou cristalloïde équilibré, selon le contexte » (consensus ADA/EASD 2024, PubMed 39052901). Le chapitre sur les fluides n'a pas pu être lu (texte complet bloqué) : après remarque Codex, la question passe en **`bloque`**. |
| M160-B2 | Trajet revérifié (PubMed 29031941, 28879524) : aucune erreur établie, **réponse inchangée**, note de revérification ajoutée. |
| M217-B3 | Après remarque Codex : « sans cholestase » retiré (l'atteinte hépatique du DRESS peut être cytolytique, cholestatique ou mixte). |
| M217-B3 | Explication hépatique du DRESS non couverte par une source lue : **bloquée**. |
| M217-A5 | Profil sérologique (IgM anti-VCA, anti-EBNA, délai de 2 à 4 mois) et phrase sur les IgG retirés : sources non lues. L'explication ne contient plus que ce que couvrent les sources PubMed lues. |
| M217-A4 | Après remarque Codex : « sans cholestase » devient « habituellement sans cholestase » (une cholestase est possible, plus rare, dans l'EBV). |
| M247-A2 | **Maintenue bloquée.** |
| Tous | Aucun `valide_expert`. |

### Règle de statut (revue Codex, 189b159)

`conforme_referentiel` = texte fidèle à l'extrait officiel. Une question dont le texte affiché **dépasse** le référentiel
d'après une source externe non lue est donc **bloquée**, pas « conforme » : M160-A2 (apyrexie limitée au début), M217-A4
(« habituellement sans cholestase »), M217-B3 (atteinte hépatique du DRESS), M247-A7 (demi-verre de soda ou de jus non allégé), comme M247-B3. Pour les
débloquer : lire la source, la citer, reclasser en `verifie_source_externe` ; ou revenir au texte du référentiel. Un test
(`donnees.test.ts`) fige la liste des questions bloquées.

## Points écartés volontairement (non transformés en questions)

| Point | Compétence | Raison |
|---|---|---|
| Insulinothérapie du coma hyperosmolaire « 0,5 à 1 UI/kg/h sans dépasser 7 UI/h pour obtenir une glycémie > 2,5 g/L » | OIC-247-30-B | Valeur et cible qui paraissent incohérentes (posologie 5 à 10 fois celle de l'acidocétose dans la compétence voisine, glycémie cible « supérieure à »). **À signaler aux éditeurs du référentiel**, ne jamais en faire une question sans relecture. |
| Seuil diagnostique « > 1,26 g/L » vs « ≥ 1,26 g/L » | OIC-247-03-A / 247-04-A | Deux compétences de l'item divergent sur la borne. La question suit 247-03-A (≥). |
| « Cause principale de mortalité du DT1 : insuffisance rénale » | OIC-247-02-A | Affirmation débattue ; non reprise (seule la phrase sur le DT2 est utilisée). |
| « Coma calme : hyperglycémie, coma agité : hypoglycémie » | OIC-247-17-A | Repère mnémotechnique non absolu ; risque de réponse présentée comme une règle. |
| Glucagon « contre-indiqué » sous sulfamide hypoglycémiant | OIC-247-25-A | Non retrouvé en source primaire (une source indique que le glucose IV est à privilégier). L'explication de M247-A6 reste volontairement générale. |
| « PCR EBV sans indication chez l'immunocompétent » | OIC-217-05-A | Non retrouvé dans les sources consultées. |
| Rythme du dépistage du DT2 (> 45 ans, tous les 3 ans / chaque année) | OIC-247-04-A | Non recoupé, et borne incohérente avec 247-03-A. |
| « 25, 45, 65 ans puis tous les 10 ans » (rappels dT) | OIC-160-03-A | Les sources consultées décrivent un intervalle de 20 ans de 25 à 65 ans puis 10 ans ; formulation exacte non confirmée. |
| Fenêtre de « 6 semaines » avant un DRESS | OIC-217-06-B | Délai variable selon les sources ; non transformé en question. |
| Classification de la rétinopathie diabétique (RDNP/RDP, % de progression) | OIC-247-11-B | Aucune source externe récupérée ; non transformée en question. |

## Erreur de recoupement évitée

Une première recherche PubMed sur la mortalité cardiovasculaire du diabète a renvoyé un article
(PMID 21515847) qui ne traitait pas du sujet (HbA1c et coronarographie) : il n'est **pas** cité. La
question M247-A5 reste donc `conforme_referentiel` faute de source externe fiable.
