
# Plan : Extraction des objectifs Rang B manquants pour 11 items EDN

## Diagnostic

**11 items sans aucun OIC Rang B** dans `backup_oic_competences` :

| Item | Titre |
|------|-------|
| IC-1 | La relation medecin-malade |
| IC-29 | Risques professionnels pour la maternite |
| IC-48 | Alimentation et besoins nutritionnels du nourrisson |
| IC-59 | Sujets en situation de precarite |
| IC-137 | Douleur chez l'enfant |
| IC-140 | Soins palliatifs (2) - Accompagnement |
| IC-164 | Exanthemes febriles de l'enfant |
| IC-180 | Risques sanitaires lies aux irradiations |
| IC-212 | Hemogramme chez l'adulte et l'enfant |
| IC-269 | Douleurs abdominales aigues |
| IC-330 | Prescription et surveillance des medicaments |

La table `oic_competences` contient 1 entree Rang B par item, mais ce sont des **placeholders generiques** ("Item EDN X - Competence medicale avancee rang B") sans contenu medical reel.

## Contrainte d'acces

LiSA (livret.uness.fr) est protege par authentification CAS UNESS. L'API MediaWiki retourne `readapidenied`. Cependant :
- Les secrets `CAS_USERNAME` et `CAS_PASSWORD` sont deja configures dans Supabase
- L'Edge Function `extract-edn-uness` contient deja toute la logique d'authentification CAS + parsing Cheerio

## Solution : Edge Function ciblee

Creer une Edge Function `extract-rangb-missing` qui :
1. Reutilise l'authentification CAS de `extract-edn-uness` (code partage)
2. Scrape uniquement les 11 pages LiSA ciblees
3. Parse les sections Rang B avec Cheerio (pattern `h2/h3` contenant "Rang B")
4. Insere les OIC extraits dans `backup_oic_competences`
5. Propage vers `edn_items_immersive` et `edn_items_complete`

### Architecture

```text
extract-rangb-missing (Edge Function)
    |
    +--> Auth CAS UNESS (secrets existants)
    |
    +--> Scrape 11 pages LiSA 2025
    |       /lisa/2025/Item_de_connaissance_1
    |       /lisa/2025/Item_de_connaissance_29
    |       ... (11 URLs)
    |
    +--> Parse HTML : sections "Rang B"
    |       Cheerio : h2/h3 contenant "rang b"
    |       Extraire tous les <li> / <p> enfants
    |
    +--> Insert backup_oic_competences
    |       objectif_id: OIC-XXX-YY-B-ZZ
    |       rang: 'B'
    |       intitule + description
    |
    +--> Propagation JSONB
            UPDATE edn_items_immersive/complete
            competences_oic_rang_b = jsonb_agg(...)
```

### Fichiers a creer/modifier

1. **`supabase/functions/extract-rangb-missing/index.ts`** (nouveau)
   - Authentification CAS (copie simplifiee de `extract-edn-uness`)
   - Liste des 11 items cibles en dur
   - Scraping + parsing des sections Rang B
   - Insertion dans `backup_oic_competences` puis propagation JSONB

2. **`supabase/config.toml`** : ajouter la config JWT pour la nouvelle fonction

### Logique de parsing Rang B

Le parsing reutilise le pattern eprouve de `unes_scraper.py` :
- Trouver les headings contenant "rang b" (case insensitive)
- Extraire les elements `<li>` et `<p>` suivants jusqu'au prochain heading
- Generer un `objectif_id` au format `OIC-XXX-YY-B-ZZ`
- Mapper la rubrique depuis le code YY

### Fallback si auth CAS echoue

Si l'authentification CAS ne fonctionne pas (credentials expires, changement de protocole), la fonction :
- Retourne un rapport d'erreur detaille
- Suggere de mettre a jour les secrets `CAS_USERNAME`/`CAS_PASSWORD`
- Ne corrompt aucune donnee existante

## Estimation

~2h (creation EF + test + deploiement + verification propagation)
