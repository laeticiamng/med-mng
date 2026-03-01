
# Audit Directeur Marketing & Commercial - MED-MNG
**Date** : 1er Mars 2026
**Score Global : 6.5/10**

---

## RESUME EXECUTIF

MED-MNG dispose d'un produit fort (367 items EDN en musique, positionnement unique) et d'un branding premium coherent. Cependant, la plateforme souffre de **lacunes critiques dans le funnel de conversion** : aucun tracking du `checkout_start`, une social proof faible (37 inscrits, 0 abonnes payants), et des CTAs qui ne dirigent pas systematiquement vers l'inscription. Le SEO technique est solide mais le contenu manque de preuves d'efficacite reelles.

---

## 1. FUNNEL DE CONVERSION (4/10) - CRITIQUE

### Constat
Le funnel de conversion est **incomplet** :

```text
page_view (44 events) -> signup (tracked) -> checkout_start (JAMAIS TRACKED) -> checkout_complete (tracked)
```

- `checkout_start` n'est **jamais emis** dans le code. Il est defini dans `conversionTracking.ts` mais aucun composant ne l'appelle.
- Resultat : impossible de mesurer le taux d'abandon entre la page Tarifs et le paiement Stripe.
- **0 abonnes payants** dans la table `subscribers` (vide).
- Seulement **12 utilisateurs** inscrits au total.
- Seulement **44 page_view** trackes (tracking incomplet, uniquement sur /pricing).

### Actions recommandees

1. **Ajouter `trackConversionEvent('checkout_start')` dans `useSubscription.createCheckout()`** avant l'appel a `create-checkout`. C'est le point exact ou l'utilisateur clique "S'abonner".

2. **Tracker les `page_view` sur toutes les pages cles** (accueil, EDN, ECOS, signup), pas uniquement /pricing.

3. **Ajouter un event `cta_click`** pour mesurer l'efficacite de chaque CTA (hero, feature showcase, final CTA).

---

## 2. SOCIAL PROOF & CREDIBILITE (5/10)

### Constat
- La page Tarifs affiche "37+ etudiants inscrits" mais la base ne contient que **12 utilisateurs**.
- Les **4 temoignages** sont fictifs (Marie L., Thomas K., Sarah M., Lucas P.) avec des CHU inventes.
- La note "4.9/5" affichee dans les stats n'est basee sur aucune donnee reelle.
- Aucun systeme de collecte d'avis reel n'est en place.

### Actions recommandees

1. **Corriger le chiffre "37+" par le nombre reel** (12) ou le retirer completement. Un chiffre faux detruit la confiance.
2. **Marquer explicitement les temoignages comme fictifs** ("Temoignages bases sur des retours beta") ou les remplacer par de vrais retours.
3. **Implementer un systeme de collecte d'avis** post-utilisation (email automatique apres 7 jours d'usage).
4. **Afficher des metriques verifiables** : "367 items couverts" et "100% du programme R2C" sont vrais et percutants - les mettre en avant.

---

## 3. STRATEGIE DE PRICING (7/10)

### Constat
- 3 plans bien differencies : Gratuit, Pro Etudiant (19EUR), Premium (39EUR)
- Essai 7 jours avec trial Stripe correctement configure
- Pack 6 mois Pro a 99EUR (economie 15EUR) - bonne idee mais presentation discrete
- Tableau comparatif Pro vs Premium clair et utile
- Trust badges pertinents (sans engagement, annulation 1 clic)

### Problemes

- **L'offre "Standard" dans Stripe (19EUR) s'appelle "Pro Etudiant" dans l'UI** mais "standard" dans le code. Confusion potentielle.
- Le plan Gratuit n'a **pas de limites clairement communiquees** dans le Hero. L'utilisateur ne sait pas ce qu'il obtient gratuitement vs payant avant d'arriver sur /pricing.
- **Pas de comparaison Gratuit vs Payant** sur la page pricing - le plan Gratuit est juste "Gratuit" sans detail des limites.

### Actions recommandees

1. **Harmoniser les noms de plans** : "Standard" partout ou "Pro Etudiant" partout, pas les deux.
2. **Communiquer les limites du gratuit** dans le Hero : "3 chansons gratuites" ou "10 QCM/jour gratuits".
3. **Ajouter une ancre prix** sur le Hero : "A partir de 0EUR" ou "Gratuit pour commencer" (deja present dans le CTA final, mais absent du Hero).

---

## 4. PARCOURS D'ACQUISITION (6/10)

### Constat du funnel Hero -> Inscription

```text
Hero ("Creer un compte gratuit") -> /med-mng/signup -> inscription -> onboarding
```

**Points positifs :**
- CTA principal clair : "Creer un compte gratuit" en gradient avec ombre
- CTA secondaire pertinent : "Voir les 367 cours" (explore sans engagement)
- Message en 3 secondes : "Apprends la medecine en musique" - excellent

**Points negatifs :**
- **5 sections a scroller avant le CTA final** (Hero, Music Player, Features, Testimonials, Final CTA). L'utilisateur non convaincu quitte avant.
- **Aucun CTA d'inscription dans les sections intermediaires** (Features, Testimonials). Seuls les CTAs dans Features redirigent vers /edn-complete et /ecos, pas vers /signup.
- **Le cookie banner chevauche les CTAs du Hero sur mobile** (visible sur le screenshot 390px).
- **Le bouton "Accessibilite"** en position fixe en haut a droite est visuellement distrayant et reduit la zone de CTA sur mobile.

### Actions recommandees

1. **Ajouter un CTA "Creer mon compte" dans la section Testimonials** apres les avis - moment de conviction maximale.
2. **Ajouter un sticky CTA mobile** (barre fixe en bas "Essayer gratuitement") qui apparait apres le scroll du Hero.
3. **Reduire le z-index du bouton Accessibilite** ou le deplacer dans le menu hamburger sur mobile.
4. **Accepter automatiquement les cookies essentiels** sans banner pour ne pas bloquer la vue du Hero.

---

## 5. SEO & ACQUISITION ORGANIQUE (8/10)

### Points forts
- 10+ pillar pages SEO (2000+ mots chacune) couvrant "ECOS 2026", "EDN", "Cas cliniques"
- JSON-LD complet (Organization, FAQPage, Article, Speakable, HowTo)
- `robots.txt` correctement configure avec autorisation des bots IA (GPTBot, Claude-Web, PerplexityBot)
- `llms.txt` bien structure pour le GEO (Generative Engine Optimization)
- `sitemap.xml` present
- Balises Open Graph et Twitter Cards sur toutes les pages

### Lacunes
- **Pas de Google Search Console** connecte (impossible de verifier l'indexation reelle)
- **Pas de Google Analytics / Plausible** pour le trafic organique reel
- Les pillar pages n'ont pas de **maillage interne systematique** entre elles

### Actions recommandees
1. **Connecter Google Search Console** et verifier l'indexation des 10+ pillar pages
2. **Ajouter un analytics tiers** (Plausible, Umami, ou GA4) pour mesurer le trafic organique reel
3. **Ajouter des liens croises** entre pillar pages ("Voir aussi : Preparation ECOS 2026")

---

## 6. RETENTION & ENGAGEMENT (5/10)

### Constat
- Systeme de gamification present (streaks, niveaux, badges) mais **invisible pour les anonymes**
- SRS (repetition espacee) implemente mais non mis en avant dans le marketing
- Chat IA therapeutique disponible
- PWA installable avec notifications push

### Problemes
- **Aucun email de relance** (drip campaign) apres inscription
- **Aucun email post-trial** avant fin de l'essai 7 jours
- Les streaks et badges ne sont visibles que dans le footer **apres connexion** - zero valeur marketing
- **Pas de partage social** des badges/reussites

### Actions recommandees
1. **Creer une sequence d'emails post-inscription** (J1 : bienvenue, J3 : premier item, J5 : rappel, J7 : fin essai)
2. **Afficher les stats de gamification dans le Hero** pour les visiteurs ("Marie a termine 12 items cette semaine" - feed en temps reel)
3. **Ajouter un bouton de partage** sur les badges et reussites

---

## 7. PAGE D'ACCUEIL - ANALYSE MARKETING (7/10)

### Structure actuelle (5 sections)
1. **Hero** : Message + 2 CTAs + badges valeur -- Excellent
2. **Music Player** : Demo audio -- Bon mais non teste (audio fictif ?)
3. **Feature Showcase** : 4 features + CTAs vers EDN/ECOS -- Manque CTA signup
4. **Testimonials** : 4 avis + stats -- Faux temoignages
5. **Final CTA** : "Creer mon compte gratuit" -- Bon mais trop bas

### Probleme structurel
La page est **trop longue pour une landing page de conversion**. Un visiteur sur mobile doit scroller 4-5 ecrans avant le CTA final. Le taux de scroll au-dela de 50% est generalement < 30%.

### Actions recommandees
1. **Reduire a 3 sections** : Hero (avec demo audio inline), Social Proof + Features, CTA Final
2. **Integrer le player audio directement dans le Hero** comme proof of concept immediate
3. **Deplacer les stats (367 items, x3 memoire, 4.9/5) dans le Hero** sous les CTAs

---

## 8. MOBILE (7/10)

### Points positifs
- Layout responsive correct, pas de debordement horizontal
- CTA empiles verticalement, taille adequate
- Hamburger menu fonctionnel
- Typography lisible

### Problemes
- Cookie banner chevauche les badges de valeur dans le Hero
- Le bouton "Accessibilite" prend de l'espace precieux en haut a droite
- Pas de sticky CTA en bas d'ecran

---

## MATRICE PRIORITES

| Action | Impact | Effort | Priorite |
|--------|--------|--------|----------|
| Tracker `checkout_start` | Eleve | Faible | P0 |
| Corriger "37+ inscrits" -> reel | Eleve | Faible | P0 |
| Ajouter sticky CTA mobile | Eleve | Moyen | P1 |
| CTA signup dans section Testimonials | Eleve | Faible | P1 |
| Sequence emails post-inscription | Eleve | Eleve | P1 |
| Connecter Google Search Console | Moyen | Faible | P2 |
| Harmoniser noms de plans | Moyen | Faible | P2 |
| Reduire sections landing page | Moyen | Moyen | P2 |
| Systeme collecte avis reels | Moyen | Moyen | P3 |
| Analytics tiers (Plausible/GA4) | Moyen | Moyen | P3 |

---

## SCORE DETAILLE

| Critere | Note | Details |
|---------|------|---------|
| Funnel de conversion | 4/10 | checkout_start non tracke, 0 paiement |
| Social proof | 5/10 | Chiffres faux, temoignages fictifs |
| Pricing | 7/10 | Bien structure, noms incoherents |
| Parcours acquisition | 6/10 | Hero excellent, sections intermediaires sans CTA signup |
| SEO technique | 8/10 | JSON-LD, sitemap, llms.txt, pillar pages |
| Retention | 5/10 | Gamification cachee, 0 email marketing |
| Landing page | 7/10 | Branding premium, trop longue |
| Mobile | 7/10 | Responsive OK, cookie banner genante |
| **Global** | **6.5/10** | |

---

## OBJECTIF : 8.5/10

En implementant les actions P0 et P1 (tracking checkout_start, correction social proof, sticky CTA mobile, CTA signup dans testimonials), le score passe a 8.5/10. Les actions P2-P3 (emails, analytics, collecte avis) porteront le score a 9+/10 sur le moyen terme.
