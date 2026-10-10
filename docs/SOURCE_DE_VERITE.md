# Med MNG — source de vérité

État **vérifié** du produit, fonctionnalité par fonctionnalité, avec la preuve et sa date. Ce qui n'est pas prouvé ici est « non vérifié ». Les rapports d'audit antérieurs sont archivés (voir `docs/archive/2025-2026/INDEX.md`) et ne font pas foi.

Chaque section est délimitée par des marqueurs `<!-- section: … -->` / `<!-- fin section: … -->` : un agent ne modifie que ses propres sections ; en cas de conflit, garder les deux sections entières.

<!-- section: decisions -->
## Décisions de l'utilisatrice (CEO)

### Génération musicale — réactivée le 09.10.2026

- **Décision** (09.10.2026, soir, explicite) : la génération musicale de Med MNG est **réactivée**, comme avant la suspension du matin. Fournisseur technique : **sunoapi.org**, **aucune migration prévue**. Ne pas supprimer l'intégration ni changer de fournisseur sans nouvelle décision de l'utilisatrice.
- **Historique** : suspendue le 09.10.2026 au matin (#232, #234), la réponse écrite de Suno indiquant que sunoapi.org n'est pas un intermédiaire autorisé. La réactivation est une décision assumée par l'utilisatrice ; aucune mention de licence, de partenariat ou d'autorisation de Suno n'est faite nulle part (test `src/tests/createAudioDisponible.test.tsx`).
- **Mécanisme** : drapeau unique `GENERATION_AUDIO_DISPONIBLE` (`supabase/functions/_shared/mm-disponibilite.ts`), lu par le site et par `mm-generate-music`. Ordre des contrôles serveur : interrupteur → abonnement Premium et quota (30 par mois) → réservation au registre `mm_generations_audio` (refus si les compteurs sont illisibles) → appel à `https://api.sunoapi.org/api/v1/generate`.
- **Qualité des paroles** : contrôles de fidélité conservés (nombres, intervalles, unités et ordinaux en toutes lettres, durée suffisante : `supabase/functions/_shared/mm-paroles-chantees.ts`, `src/tests/parolesChantees.test.ts`).
- **Offre** : 69 €/an ou 9,90 €/mois, 30 générations audio par mois (prix Stripe `medmng_premium_annual` / `medmng_premium_monthly`, vérifiés le 09.10.2026).
<!-- fin section: decisions -->

<!-- section: securite-base-partagee -->
## Sécurité base partagée (Supabase `yaincoxihiqdksxgrsrk`, partagée avec EmotionsCare)

Vérifié le 09.10.2026 sur la production. Analyse complète (fonctions SECURITY DEFINER, politiques RLS, Storage, alertes de performance) : dépôt emotionscare, `docs/securite/DEFINER_REQUALIFICATION.md`.

- **Essai gratuit préservé** : `mm_items_gratuits()` (10 items), `mm_contenu_immersif_item(text)`, `mm_etat_contenu_immersif()` restent appelables sans compte ; colonnes Premium de `edn_items_immersive` sans droit direct pour anon/authenticated.
- **Fonctions `med_mng_*` et `secure_generate_music`** : plus d'accès anonyme (A19 bis), accès des comptes connectés conservé (génération musicale réactivée le 09.10.2026). Fonctions de trigger Med MNG/EDN (quota, compteurs, `updated_at`) : EXECUTE retiré à anon/authenticated sans effet sur leur déclenchement.
- **Performance RLS** : politiques des tables `mm_*`, `med_mng_*`, `*edn*` en `(select auth.uid())` (0 alerte `auth_rls_initplan`).
- **`ai_generated_content`** : lisible par tout compte connecté jusqu'au 10.10.2026 (62 lignes : `edn-premium`, `ecos-premium`, fiches générées, un questionnaire de santé d'une autre application) → lecture réservée aux administrateurs (migration `20261010022829_mm_ai_generated_content_admin`, appliquée le 10.10.2026, PR #240). **Reste à décider** : index en double `idx_edn_items_unified_item_code` à supprimer à la main.
- **Test** : `supabase/tests/securite_essai_gratuit.sql` — OK le 09.10.2026. **Migration** : `20261009190700_mm_securite_definer_et_initplan.sql` (appliquée et enregistrée).
<!-- fin section: securite-base-partagee -->

<!-- section: etat-10-10 -->
## État au 10.10.2026 (vérifications par MCP Supabase / Stripe / Lovable ; pas d'accès navigateur à la production)

### Génération musicale (réactivée)
- **Fonctions déployées** : `mm-generate-music` v45, `mm-create-checkout` v42, `mm-customer-portal` v42, `mm-stripe-webhook` v43, `send-welcome-email` v894 : point d'entrée épinglé sur le commit de fusion `d9e5dfd0` (#238), drapeau `GENERATION_AUDIO_DISPONIBLE = true` (vérifié par `get_edge_function`). `mm-suno-callback` v42 et `mm-music-status` v27 ne dépendent pas du drapeau.
- **Front** : projet Lovable `1b544bf9…` sur `aa718901` (= `main` après #239), republié le 10.10.2026 (`deploy_project`).
- **Données** : dernière génération réussie le 05.10.2026 (registre `mm_generations_audio` : 11 « terminee » ; `generated_music_tracks` : pistes `completed` stockées dans le bucket public `mm-chansons`, 6 objets ; `med_mng_songs` : 20). **Aucune génération depuis la réactivation** (journaux du 09.10 : seulement des appels de contrôle sans jeton → 401). Abonnés Premium actifs : **0** (Stripe et `user_subscriptions` concordent : 2 abonnements Med MNG, résiliés). Quota serveur 30/mois = textes du site et `public/llms.txt`.
- **Secret `SUNO_API_KEY`** : non listable par les outils disponibles ; présence déduite des générations réussies du 04–05.10.2026. **Non vérifié** depuis.
- **Non vérifié** : une génération complète de bout en bout depuis la réactivation (nécessite un compte Premium ou administrateur ; aucun administrateur n'existe dans `user_roles`).

### Sécurité
- `ai_generated_content` : voir section « Sécurité base partagée » (preuve : `supabase/tests/securite_ai_generated_content.sql` exécuté en production, compte quelconque 0 ligne, anon 0, clé de service 62, administrateur temporaire 62).
- Contenu Premium : `supabase/tests/securite_essai_gratuit.sql` étendu et exécuté en production le 10.10.2026 — 367 items actifs, **357 verrouillés** pour un compte sans abonnement, 10 items d'essai ouverts, colonnes Premium de `edn_items_complete` sans droit direct, rang B présent pour les 9 items d'essai qui en ont (IC-1 : 0 compétence de rang B au référentiel).

### Défauts du test en production du 09.10.2026
| Défaut | Cause établie | Correction | État |
|---|---|---|---|
| `send-welcome-email` 502 | Resend 422 `validation_error` : compte de test `@example.com` (domaine réservé) ; le 429 suivant = quota de 2 envois/jour | adresse non livrable détectée avant envoi ; refus définitif 400/422 → 200 `envoye:false` | PR #241, **en attente de fusion et de déploiement** |
| Suppression de compte ~24 s sans retour | aucun état visible ; toast effacé par la redirection immédiate ; confirmation hors écran | état « en cours », focus/scroll sur la confirmation, message + toast, redirection après 3 s | PR #241 |
| ~97 requêtes / 12 s sur `/edn-complete`, `auth/v1/user` ×6 | ~50 appels `getUser()` (réseau) et ~40 `loadStats()` (5 requêtes chacun) | `getUser()` partagé (cache 30 s), statistiques de gamification partagées | PR #241 |
| 2 × 401 `user_gamification_stats` à la déconnexion | `upsert` d'un chargement commencé avant `signOut` (edge_logs 22:16:44) | plus d'écriture sans session, cache vidé au `SIGNED_OUT` | PR #241 |
| « insuffisance cardiaque » → IC-348 en tête | IC-348 n'est trouvé que par une compétence ; IC-234 par son titre | titre avant compétence (bibliothèque), réponses périmées ignorées (⌘K) ; contenu inchangé | PR #241 |
| Bandeau cookies sur le panneau d'accessibilité (mobile) | z-index 100 > 50, focus non piégé | Sheet Radix, bandeau masqué pendant une fenêtre modale | PR #237 (revue Codex OK, CI verte), **en attente de fusion** |

### Paiement (Stripe, lecture seule)
- Prix `medmng_premium_annual` 6 900 ¢ EUR/an et `medmng_premium_monthly` 990 ¢ EUR/mois, TTC (`tax_behavior: inclusive`), produit `prod_VMibhvWumvzzee` (`metadata.app = medmng`).
- Webhook `we_1ULrC3…` → `mm-stripe-webhook` : version d'API **2025-05-28.basil** ; le code utilise le SDK en **2025-08-27.basil**. Compatible : même famille « basil » (périodes portées par les `items`, lues avec repli) et l'abonnement est relu chez Stripe avec la version du code avant toute écriture.
- Description du produit Stripe encore « Génération audio bientôt disponible » : réalignée automatiquement au prochain passage par `mm-create-checkout` (`alignerDescriptionProduit`) ; non modifiée à la main (lecture seule).

### Domaine
- `www.medmng.com` répond 502 (constat du test du 09.10) ; DNS non consultable depuis cet environnement. Action humaine : voir le rapport de la session du 10.10.2026 (ajouter `www.medmng.com` dans Lovable → Settings → Domains, redirigé vers `medmng.com`, et l'enregistrement DNS demandé par Lovable).

### Fusions bloquées
- La fusion des PR par l'agent a été refusée par la politique de permissions de la session : #237, #240, #241 et la PR de documentation attendent une fusion humaine (CI verte et revue Codex sur le dernier commit à vérifier sur chaque PR).
<!-- fin section: etat-10-10 -->
