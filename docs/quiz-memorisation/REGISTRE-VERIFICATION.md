# Registre de vérification — questions de mémorisation (pilote)

Mis à jour le 15.10.2026. Source de vérité des données : `src/data/quizMemorisation/ic-*.ts`
(le tableau ci-dessous en est extrait ; en cas d'écart, les fichiers de données font foi).

## Ce que « vérifié » veut dire ici

| Statut | Signification | Affichable |
|---|---|---|
| `brouillon` | Jamais affichée. | non |
| `conforme_referentiel` | Fidèle au texte officiel : l'extrait cité est retrouvé **mot pour mot** dans `oic_competences`. Pas recoupée par une source externe. | pilote seulement |
| `verifie_source_externe` | Idem, **et** recoupée par au moins une source externe citée (PubMed, HAS). | pilote seulement |
| `valide_expert` | Relue et validée par un médecin. | **production** |

**Aucune des 28 questions n'est `valide_expert`.** Les 8 questions `verifie_source_externe` ont été
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

| ID | Type | Compétence | Statut | Réponse correcte | Sources externes | Réserves |
|---|---|---|---|---|---|---|
| M160-A1 | QCM | OIC-160-04-A | `conforme_referentiel` | Un trismus | — | — |
| M160-A2 | Rappel | OIC-160-04-A | `conforme_referentiel` | Contraction généralisée, descendante, dysautonomie, sans fièvre | — | Pas de source externe retrouvée dans la recherche du 15.10.2026 (requête PubMed sans résultat) : à recouper lors de la relecture médicale. |
| M160-A3 | QCM | OIC-160-03-A | `conforme_referentiel` | Immunoglobulines tétaniques 250 UI dans un bras, vaccin dans l’autre | — | Recoupement partiel : la recherche web du 15.10.2026 a restitué le même tableau (vaccination-info-service.fr, mesvaccins.net) mais le document n’a pas pu être ouvert. À confronter au calendrier vaccinal en vigueur lors de la relecture médicale. |
| M160-A4 | QCM | OIC-160-03-A | `conforme_referentiel` | Une dose de vaccin contenant la valence tétanique | — | Même réserve que M160-A3 (tableau non ouvert à la source). |
| M160-A5 | QCM | OIC-160-03-A | `conforme_referentiel` | Un ulcère de jambe d’origine vasculaire | — | — |
| M160-A6 | Rappel | OIC-160-03-A | `conforme_referentiel` | Bactérie ubiquitaire des sols | — | — |
| M160-B1 | QCM | OIC-160-01-B | `verifie_source_externe` | Les interneurones inhibiteurs | [Connan & Popoff, Curr Top Microbiol Immunol 2017 (PubMed 28879524)](https://doi.org/10.1007/82_2017_50)<br>[Surana et al., Toxicon 2017 (PubMed 29031941)](https://doi.org/10.1016/j.toxicon.2017.10.008) | — |
| M160-B2 | Rappel | OIC-160-01-B | `verifie_source_externe` | Sang → transport rétrograde (motoneurones) → relais synaptique médullaire → interneurones inhibiteurs | [Connan & Popoff, Curr Top Microbiol Immunol 2017 (PubMed 28879524)](https://doi.org/10.1007/82_2017_50)<br>[Surana et al., Toxicon 2017 (PubMed 29031941)](https://doi.org/10.1016/j.toxicon.2017.10.008) | — |
| M217-A1 | QCM | OIC-217-01-A | `conforme_referentiel` | Plus de 50 % d’éléments mononucléés, avec au moins 10 % de lymphocytes activés | — | Un support de cours (Pilly étudiant ECN 2020, item 217, extrait de recherche web) donne « plus de 10 % » de lymphocytes activés : la borne (≥ ou >) varie selon les sources, la question ne repose pas dessus. |
| M217-A2 | QCM | OIC-217-05-A | `conforme_referentiel` | La primo-infection à EBV | — | Pourcentages (80 % / 10 %) non recoupés par une source externe. |
| M217-A3 | QCM | OIC-217-05-A | `verifie_source_externe` | Les aminopénicillines | [Chovel-Sella et al., Pediatrics 2013 (PubMed 23589810)](https://doi.org/10.1542/peds.2012-1575) | — |
| M217-A4 | Rappel | OIC-217-05-A | `conforme_referentiel` | Cytolyse hépatique sans cholestase | — | — |
| M217-A5 | QCM | OIC-217-05-A | `conforme_referentiel` | Le MNI test, avec ou sans sérologies EBV | — | Le point « PCR EBV sans indication chez l’immunocompétent » du même passage n’a PAS été retrouvé dans les sources externes (recherche du 15.10.2026) : volontairement non utilisé. |
| M217-A6 | QCM | OIC-217-04-A | `conforme_referentiel` | Un contact avec un chat ou de la viande crue | — | — |
| M217-B1 | QCM | OIC-217-02-B | `conforme_referentiel` | De grands lymphocytes T activés hyperbasophiles, sans blaste | — | — |
| M217-B2 | Rappel | OIC-217-06-B | `verifie_source_externe` | Antibiotiques (sulfamides, bêta-lactamines), anticonvulsivants, allopurinol | [Ramirez et al., Microorganisms 2023 (PubMed 36838310)](https://doi.org/10.3390/microorganisms11020346) | Les bêta-lactamines ne figurent pas dans le résumé de la source externe : à recouper. |
| M217-B3 | QCM | OIC-217-06-B | `verifie_source_externe` | Une hyperéosinophilie | [Ramirez et al., Microorganisms 2023 (PubMed 36838310)](https://doi.org/10.3390/microorganisms11020346) | — |
| M247-A1 | QCM | OIC-247-03-A | `verifie_source_externe` | ≥ 1,26 g/L | [HAS, « Parcours de soins du patient adulte vivant avec un diabète de type 2](https://www.has-sante.fr/upload/docs/application/pdf/2025-07/parcours_de_soins_du_patient_adulte_vivant_avec_un_diabete_de_type_2_-_14_messages_cles_pour_ameliorer_votre_pratique.pdf) | La compétence 247-04-A écrit « > 1.26 » alors que 247-03-A écrit « ≥ 1,26 » : la question suit 247-03-A et 247-01-A (« supérieure à 1,26 g/l »). Divergence à signaler aux éditeurs du référentiel. |
| M247-A2 | QCM | OIC-247-03-A | `conforme_referentiel` | Glycémie à jeun entre 1,10 et 1,26 g/L | — | Non recoupé par une source externe : la recherche du 15.10.2026 n’a pas restitué le passage HAS sur l’HGPO. |
| M247-A3 | Rappel | OIC-247-03-A | `conforme_referentiel` | ≥ 2 g/L (11 mmol/L) | — | Des supports secondaires (extraits de recherche) donnent le même seuil ; aucun document primaire ouvert. |
| M247-A4 | QCM | OIC-247-02-A | `conforme_referentiel` | Début rapide, hyperglycémie > 3 g/L, cétose souvent présente | — | Profil « typique » : des formes atypiques existent (la HAS demande un avis spécialisé si présentation inhabituelle). |
| M247-A5 | Rappel | OIC-247-02-A | `conforme_referentiel` | Les maladies cardiovasculaires | — | Aucune source externe fiable retrouvée par la requête PubMed du 15.10.2026 (un résultat non pertinent a été écarté). |
| M247-A6 | QCM | OIC-247-25-A | `conforme_referentiel` | Le resucrage par la bouche | — | — |
| M247-A7 | Rappel | OIC-247-25-A | `conforme_referentiel` | 15 g de sucre (3 morceaux), soda ou bonbons | — | — |
| M247-A8 | QCM | OIC-247-25-A | `conforme_referentiel` | Un sulfamide hypoglycémiant | — | Formulation « source classique » choisie pour ne pas affirmer qu’aucun autre traitement ne peut contribuer à une hypoglycémie. |
| M247-B1 | QCM | OIC-247-08-B | `verifie_source_externe` | Anti-GAD | [Thomas et al., Diabetes Care 2023 (PubMed 36802355)](https://doi.org/10.2337/dc22-2159) | — |
| M247-B2 | Rappel | OIC-247-09-B | `verifie_source_externe` | Insulinorésistance + altération de l’insulinosécrétion | [Galicia-Garcia et al., Int J Mol Sci 2020 (PubMed 32872570)](https://doi.org/10.3390/ijms21176275) | — |
| M247-B3 | QCM | OIC-247-29-B | `conforme_referentiel` | Du sérum salé isotonique (NaCl 0,9 %) | — | Le reste de la compétence (débit d’insuline, seuil de kaliémie) n’est volontairement pas interrogé : à recouper avant tout usage. |

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
