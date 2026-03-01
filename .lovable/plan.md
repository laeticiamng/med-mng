

# Audit GEO & SEO Complet - Sitemap, Meta Tags & Structured Data

**Score actuel : 7/10** -- Objectif apres corrections : 9.5/10

---

## PROBLEMES CRITIQUES DETECTES

### 1. 10 pillar pages SEO absentes du sitemap ET du seoConfig (CRITIQUE)

Les 10 pages pilier SEO (2000+ mots chacune, principal levier d'acquisition organique) ne sont referencees **nulle part** :

- `/preparation-ecos-2026`
- `/reussir-edn`
- `/fiches-ecos-interactives`
- `/simulation-examen-edn`
- `/cas-cliniques-edn`
- `/erreurs-frequentes-ecos`
- `/classement-edn-explique`
- `/rang-a-vs-rang-b`
- `/travailler-cas-cliniques`
- `/exemple-cas-clinique`

**Impact** : Google ne les indexe probablement pas. Elles n'ont pas de meta description via AutoSEO (tombent dans le fallback generique). Pas de canonical, pas de keywords dedies. Le `llms.txt` reference `/fiches-ecos-interactives` mais le sitemap non.

**Correction** :
- Ajouter les 10 routes dans `src/config/seoConfig.ts` (SEO_CONFIG) avec title, description, keywords, canonical, ogType: 'article'
- Ajouter les 10 routes dans `scripts/generate-sitemap.ts` (PUBLIC_ROUTES) et dans `public/sitemap.xml`
- Priorite sitemap : 0.8 (contenu pilier), changefreq: monthly

### 2. AutoSEO ne passe qu'un seul JSON-LD sur la homepage (BUG)

Dans `AutoSEO.tsx` ligne 40 :
```
structuredData={structuredData ? structuredData[0] : undefined}
```

Seul le premier schema (Organization) est passe a SEOHead. Les 3 autres (SoftwareApplication, EducationalApplication, FAQPage) sont ignores. `GlobalJsonLd` compense partiellement ce probleme car il est aussi present dans App.tsx, mais cela cree des **doublons** du schema Organization sur la homepage.

**Correction** : Retirer la logique structuredData de `AutoSEO.tsx` puisque `GlobalJsonLd` gere deja tous les JSON-LD de maniere plus complete. Cela elimine aussi les doublons.

### 3. JSON-LD AggregateRating avec fausses donnees (RISQUE)

Dans `jsonLdSchemas.ts` :
```
aggregateRating: { ratingValue: '4.8', ratingCount: '256' }
```

La plateforme a 12 utilisateurs et 0 avis reel. Google peut infliger une penalite manuelle pour des donnees structurees trompeuses. Present dans `createSoftwareApplicationSchema()` ET `createProductSchema()`.

**Correction** : Supprimer les blocs `aggregateRating` des deux schemas tant qu'il n'y a pas de vritable systeme d'avis.

### 4. FAQ JSON-LD duplique (SEO + GEO)

`createFAQPageSchema()` et `createGEOFAQSchema()` sont deux schemas FAQPage distincts injectes sur la meme page (homepage et pricing). Google peut ignorer les deux s'il detecte des doublons du meme type.

**Correction** : Fusionner en un seul FAQPage combine (questions SEO classiques + questions GEO conversationnelles).

---

## PROBLEMES MODERES

### 5. Sitemap : lastmod statique (2026-02-10) sur toutes les URLs

Toutes les 35 URLs ont la meme date lastmod. Google ignore les lastmod quand elles semblent non fiables. Ce signal perd toute valeur.

**Correction** : Mettre a jour le script `generate-sitemap.ts` pour utiliser la date du jour (`TODAY`) et regenerer le sitemap. A terme, utiliser les vraies dates de modification.

### 6. Incoherence pricing dans les JSON-LD

- `jsonLdSchemas.ts` mentionne 3 plans : Gratuit (0EUR), Premium (39EUR), Institution (99EUR)
- `seoConfig.ts` mentionne : Standard (19EUR), Pro (29EUR), Premium (39EUR)
- `llms.txt` mentionne : Gratuit, Premium (39EUR), Institution (99EUR)
- L'UI affiche : Gratuit, Pro Etudiant (19EUR), Premium (39EUR)

**Correction** : Harmoniser tous les fichiers avec les vrais plans affiches dans l'UI.

### 7. `llms.txt` reference une page inexistante dans le sitemap

La ligne `Fiches ECOS : https://med-mng.lovable.app/fiches-ecos-interactives` est correcte mais la page n'est pas dans le sitemap (voir point 1).

### 8. Pages dans le sitemap qui devraient etre noindex

Certaines routes dans le sitemap sont des outils utilisateur connecte et n'ont pas de valeur SEO :
- `/my-goals` (objectifs perso)
- `/mood-tracker` (suivi d'humeur perso)
- `/achievements` (badges perso)
- `/progress-dashboard` (progression perso)
- `/statistics` (stats perso)

**Correction** : Soit les retirer du sitemap, soit les garder si le contenu est accessible aux anonymes (a verifier).

---

## CE QUI FONCTIONNE BIEN

- **robots.txt** : excellent, couvre tous les bots (Google, Bing, Twitter, Facebook, GPTBot, Claude-Web, PerplexityBot, Applebot)
- **GEO schemas** (Speakable, HowTo, DefinedTerm, Dataset, Expertise) : implementation de qualite, bien ciblee
- **SEOHead** : meta OG, Twitter Cards, canonical, keywords -- complet
- **GlobalSecurityHeaders** : CSP grade A, HSTS, preconnect
- **llms.txt** : bien structure, proposition de valeur claire
- **seoConfig.ts** : 50+ routes avec meta uniques, fallback generique, pattern matching dynamique
- **noindex** correctement applique sur les routes admin/internes (30+ routes)

---

## PLAN DE CORRECTIONS

### Phase 1 : Pillar pages dans le SEO (Impact maximal)

1. **`src/config/seoConfig.ts`** : Ajouter 10 entrees pour les pillar pages avec title optimise (~55 chars), description (~150 chars), keywords long-tail, canonical, ogType: 'article'

2. **`scripts/generate-sitemap.ts`** : Ajouter les 10 routes pillar dans PUBLIC_ROUTES

3. **`public/sitemap.xml`** : Regenerer avec les 10 nouvelles URLs (priority 0.8, changefreq monthly, lastmod aujourd'hui)

### Phase 2 : JSON-LD cleanup

4. **`src/components/seo/AutoSEO.tsx`** : Supprimer la logique structuredData redondante (GlobalJsonLd s'en charge deja)

5. **`src/components/seo/jsonLdSchemas.ts`** : Supprimer les `aggregateRating` des schemas SoftwareApplication et Product

6. **`src/components/seo/GlobalJsonLd.tsx`** : Fusionner createFAQPageSchema + createGEOFAQSchema en un seul schema FAQPage

### Phase 3 : Coherence donnees

7. **`src/components/seo/jsonLdSchemas.ts`** : Harmoniser les noms et prix des plans (Gratuit, Pro Etudiant 19EUR, Premium 39EUR)

8. **`public/llms.txt`** : Mettre a jour les tarifs pour matcher l'UI

9. **`public/sitemap.xml`** : Mettre a jour les lastmod a la date du jour (2026-03-01)

---

## SCORE PROJETE APRES CORRECTIONS

| Critere | Avant | Apres |
|---------|-------|-------|
| Sitemap completude | 5/10 | 10/10 |
| Meta tags coverage | 6/10 | 10/10 |
| JSON-LD qualite | 6/10 | 9/10 |
| GEO optimization | 9/10 | 9/10 |
| Coherence donnees | 4/10 | 9/10 |
| robots.txt | 10/10 | 10/10 |
| **Global** | **7/10** | **9.5/10** |

