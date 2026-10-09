# Med MNG — source de vérité

État **vérifié** du produit, fonctionnalité par fonctionnalité, avec la preuve et sa date. Ce qui n'est pas prouvé ici est « non vérifié ». Les rapports d'audit antérieurs sont archivés (voir `docs/archives/`) et ne font pas foi.

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
- **À décider (Med MNG)** : `ai_generated_content` (contenus `edn-premium`, `ecos-premium`) est lisible par tout compte connecté ; index en double `idx_edn_items_unified_item_code` à supprimer à la main.
- **Test** : `supabase/tests/securite_essai_gratuit.sql` — OK le 09.10.2026. **Migration** : `20261009190700_mm_securite_definer_et_initplan.sql` (appliquée et enregistrée).
<!-- fin section: securite-base-partagee -->
