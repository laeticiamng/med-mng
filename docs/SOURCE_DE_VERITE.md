# Med MNG — source de vérité

État **vérifié** du produit, avec la preuve et sa date. Chaque section est délimitée par des marqueurs `<!-- section: … -->` / `<!-- fin section: … -->` : un agent ne modifie que ses propres sections ; en cas de conflit, garder les deux sections entières.

<!-- section: securite-base-partagee -->
## Sécurité base partagée (Supabase `yaincoxihiqdksxgrsrk`, partagée avec EmotionsCare)

Vérifié le 09.10.2026 sur la production. Analyse complète (fonctions SECURITY DEFINER, politiques RLS, Storage, alertes de performance) : dépôt emotionscare, `docs/securite/DEFINER_REQUALIFICATION.md`.

- **Essai gratuit préservé** : `mm_items_gratuits()` (10 items), `mm_contenu_immersif_item(text)`, `mm_etat_contenu_immersif()` restent appelables sans compte ; colonnes Premium de `edn_items_immersive` sans droit direct pour anon/authenticated.
- **Fonctions `med_mng_*` et `secure_generate_music`** : plus d'accès anonyme (A19 bis), accès des comptes connectés conservé (génération musicale réactivée le 09.10.2026). Fonctions de trigger Med MNG/EDN (quota, compteurs, `updated_at`) : EXECUTE retiré à anon/authenticated sans effet sur leur déclenchement.
- **Performance RLS** : politiques des tables `mm_*`, `med_mng_*`, `*edn*` en `(select auth.uid())` (0 alerte `auth_rls_initplan`).
- **À décider (Med MNG)** : `ai_generated_content` (contenus `edn-premium`, `ecos-premium`) est lisible par tout compte connecté ; index en double `idx_edn_items_unified_item_code` à supprimer à la main.
- **Test** : `supabase/tests/securite_essai_gratuit.sql` — OK le 09.10.2026. **Migration** : `20261009190700_mm_securite_definer_et_initplan.sql` (appliquée et enregistrée).
<!-- fin section: securite-base-partagee -->
