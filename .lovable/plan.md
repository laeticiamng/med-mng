
# Audit Pricing : Incohérences critiques détectées

## Problème principal : les prix, quotas et noms de plans sont différents dans 5 endroits du code

### Source de vérité : Base de données `subscription_plans`

| Plan | Prix | Quota | Features |
|------|------|-------|----------|
| Gratuit (free) | 0 EUR | 3/mois | tableaux: non, quiz: non, BD: non, save: non |
| Standard | 19 EUR | 30/mois | tableaux: oui, quiz: non, BD: non, save: oui |
| Pro | 29 EUR | 300/mois | tableaux: oui, quiz: oui, BD: non, save: oui |
| Premium | 39 EUR | 3000/mois | tableaux: oui, quiz: oui, BD: oui, save: oui |

### Incohérences trouvées

| Fichier | Problème | Gravité |
|---------|----------|---------|
| `MedMngSubscribe.tsx` (ligne 14-18) | Prix FAUX : Standard=9.99, Pro=29.99, Premium=49.99 au lieu de 19/29/39 | **P0 - Bloquant** |
| `ProfileSubscription.tsx` (ligne 18-44) | Prix FAUX : Premium=9.99/mois, Pro=19.99/mois. Quotas FAUX : Premium=50, Pro=100, Free=2 au lieu de 3000/300/3 | **P0 - Bloquant** |
| `CGU.tsx` (ligne 152-156) | Plans FAUX : mentionne "Basic" et "Enterprise" qui n'existent pas. Quotas FAUX : Basic=10, Premium=30, Enterprise=100 | **P0 - Bloquant** |
| `PricingPlans.tsx` (composant alternatif, ligne 23-69) | Prix correct (19/29/39) mais features hardcodées et non alignées avec la DB (ex: "QCM illimités" pour Standard alors que quiz=false en DB) | **P1 - Majeur** |
| `PricingPlans.tsx` | Mentionne "Audio standard (MNG 3.5)", "Audio premium (MNG 4)", "Audio high premium studio (MNG 4.5)" -- ces niveaux audio n'existent nulle part dans le code | **P1 - Majeur** |
| `PricingPlans.tsx` | "QCM entraînement test" pour Pro et Premium -- feature qui existe (ExamMode) mais pas gated par abonnement | **P1 - Moyen** |
| `PricingPlans.tsx` | "Reset mensuel" pour Pro et Premium -- pas clair ce que cela signifie, tous les plans ont un quota mensuel | **P2 - Mineur** |

### Fonctionnalités annoncées vs réalité

| Feature annoncée | Existe dans le code ? | Gated par plan ? |
|-----------------|----------------------|-----------------|
| Génération musicale (X chansons/mois) | Oui (generator, quotas) | Oui (quota DB) |
| QCM illimités | Oui (ExamMode, quiz) | Non -- accessible à tous |
| Tableaux Rang A et B | Oui (EDN tableaux) | Partiellement (feature flag DB mais pas de gate côté frontend vérifiable) |
| Bande dessinée | Oui (EnhancedBandeDessinee, comic panels) | Partiellement (feature flag DB) |
| Sauvegarde bibliothèque | Oui (music library) | Partiellement (feature flag DB) |
| Support email/prioritaire/VIP | Aucune implémentation technique | Non vérifiable |
| Audio MNG 3.5/4/4.5 | Aucune implémentation de niveaux audio | Non -- même API pour tous |
| QCM entraînement test | Oui (ExamMode) | Non -- accessible à tous |
| Flashcards | Oui (Flashcards page) | Non -- accessible à tous |

---

## Plan de corrections

### 1. Aligner `MedMngSubscribe.tsx` sur les prix DB (P0)
Corriger les prix hardcodés ligne 14-18 :
- Standard : 9.99 -> 19
- Pro : 29.99 -> 29
- Premium : 49.99 -> 39

### 2. Corriger `ProfileSubscription.tsx` (P0)
Remplacer les prix et quotas hardcodés pour refléter la DB :
- Premium : 39 EUR, 3000 crédits
- Pro : 29 EUR, 300 crédits  
- Standard : 19 EUR, 30 crédits
- Free : 0 EUR, 3 crédits

### 3. Corriger `CGU.tsx` (P0)
Remplacer les plans fictifs (Basic, Enterprise) par les vrais plans (Free, Standard, Pro, Premium) avec les bons quotas.

### 4. Nettoyer `PricingPlans.tsx` (P1)
Aligner les features hardcodées avec ce qui est réellement dans la DB :
- Standard : retirer "QCM illimités" (quiz=false en DB)
- Retirer les mentions "MNG 3.5/4/4.5" (pas de différenciation audio réelle)
- Clarifier "Reset mensuel" ou le retirer

### 5. Pas de changement sur `MedMngPricing.tsx`
Ce composant lit directement la DB -- il est correct par construction.

---

## Détails techniques

### Fichiers à modifier :
1. `src/pages/MedMngSubscribe.tsx` -- ligne 14-18 : prix
2. `src/components/med-mng/profile/ProfileSubscription.tsx` -- ligne 18-50 : prix, quotas, features
3. `src/pages/CGU.tsx` -- ligne 152-156 : noms plans et quotas
4. `src/components/med-mng/PricingPlans.tsx` -- ligne 23-69 : features non alignées

### Aucun changement DB requis
La source de vérité (table `subscription_plans`) est correcte.
