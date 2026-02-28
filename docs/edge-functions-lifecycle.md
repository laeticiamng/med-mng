# Edge Functions Lifecycle — Runbook

## 1. Ajouter une nouvelle Edge Function

1. Créer `supabase/functions/<nom>/index.ts`
2. Ajouter l'entrée dans `supabase/config.toml` si `verify_jwt` doit être `false`
3. Mettre à jour `docs/supabase-functions-flow.md` section 1 (fonctions actives)
4. Ajouter les tests dans `supabase/functions/<nom>/` ou `supabase/functions/system/`
5. Vérifier le déploiement avec `supabase--deploy_edge_functions`

## 2. Déprécier une Edge Function (410 Gone)

Quand la fonction reste déployée mais ne doit plus être utilisée :

1. Remplacer le corps par un handler 410 :
   ```ts
   return new Response(JSON.stringify({
     success: false,
     message: '<nom> est désactivé.',
     status: 'disabled'
   }), { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
   ```
2. Ajouter un commentaire `@deprecated` en haut du fichier
3. Ajouter l'entrée dans `supabase/functions/_shared/deleted-functions.ts` avec `status: "deprecated"`
4. Mettre à jour `docs/supabase-functions-flow.md` section 2
5. Supprimer toutes les références front (hooks, composants, utils)

## 3. Supprimer une Edge Function (404)

Quand l'endpoint est complètement retiré :

1. Supprimer le dossier `supabase/functions/<nom>/`
2. Ajouter l'entrée dans `supabase/functions/_shared/deleted-functions.ts` avec `status: "removed"` ou `"consolidated"`
3. Mettre à jour `docs/supabase-functions-flow.md` section 2
4. Rechercher et supprimer toutes les références :
   - `grep -r "<nom>" src/` (hooks, services, utils, composants)
   - `grep -r "<nom>" supabase/` (cron jobs, triggers, autres EF)
5. Vérifier que les tests `deleted-functions_test.ts` passent (l'endpoint retourne 404)

## 4. Checklist PR obligatoire

- [ ] `_shared/deleted-functions.ts` mis à jour
- [ ] `docs/supabase-functions-flow.md` mis à jour
- [ ] Aucune référence front résiduelle (`grep` propre)
- [ ] Tests `deleted-functions_test.ts` passent
- [ ] Aucun cron job orphelin dans les migrations
- [ ] Secrets inutilisés documentés pour suppression

## 5. Cron jobs & triggers

Avant de supprimer une EF, vérifier :
- `supabase/migrations/` pour des `extensions.schedule()` pointant vers l'EF
- Les triggers DB qui pourraient appeler l'EF via `pg_net`
- Les secrets dans le dashboard associés uniquement à cette EF
