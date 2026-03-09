

# Plan : Correctifs restants post-audit

## Etat des lieux

Apres les passes precedentes, il reste 3 categories de corrections :

### 1. Console logs non gardes (~15 fichiers, ~80 occurrences)

Fichiers avec `console.log/warn` NON entoures de `import.meta.env.DEV` :

**Scripts audit (dev-only, bulk non garde) :**
- `src/scripts/audit/runIC2Audit.ts` — 15 `console.log` bruts
- `src/scripts/audit/applyIC2Completion.ts` — 12 `console.log` bruts
- `src/scripts/audit/analyzers/ic1MedicalContentChecker.ts` — 2 `console.log` bruts

**Composants/hooks runtime (erreurs catch) :**
- `src/components/generator/GenerationNotificationHandler.tsx` — 2 `console.warn` (catch blocks)
- `src/components/onboarding/DynamicOnboarding.tsx` — 1 `console.warn`
- `src/components/revision/RevisionDashboard.tsx` — 1 `console.warn`
- `src/components/backup/DataExportManager.tsx` — 1 `console.warn`
- `src/components/debug/AudioDebugger.tsx` — 1 `console.warn`
- `src/contexts/InternationalizationContext.tsx` — 1 `console.warn` (missing key)
- `src/contexts/PerformanceContext.tsx` — 1 `console.warn`
- `src/hooks/useEdnItemV2.ts` — 1 `console.warn` + 1 `console.error`
- `src/hooks/useTypeSafeState.ts` — 3 `console.warn` (localStorage catch)
- `src/hooks/useDiagnosticLogs.ts` — 1 `console.warn` + 1 `console.debug`
- `src/services/musicService.ts` — 2 `console.warn`
- `src/lib/api-client.ts` — 1 `console.warn`

### 2. Edge Function CORS : `med-mng-api/types.ts` wildcard `*`

Un fichier `supabase/functions/med-mng-api/types.ts` exporte `corsHeaders` avec `Allow-Origin: '*'` — c'est le seul wildcard restant et il manque les headers Supabase standard. Les 10 fonctions avec local `corsHeaders` hardcoded a `med-mng.lovable.app` sont acceptables (production domain), mais `med-mng-api` utilise `*`.

### 3. Script `auditor.ts` — 1 `console.warn` non garde

---

## Plan d'implementation

### Tache 1 : Garder les scripts audit avec `import.meta.env.DEV`
- `runIC2Audit.ts` : wrapper tout le corps dans `if (!import.meta.env.DEV) return`
- `applyIC2Completion.ts` : idem
- `ic1MedicalContentChecker.ts` : garder les 2 logs
- `auditor.ts` : garder le warn

### Tache 2 : Garder les console.warn runtime dans les catch blocks
Pour chaque fichier : ajouter `if (import.meta.env.DEV)` devant le `console.warn`.

Fichiers concernes : GenerationNotificationHandler, DynamicOnboarding, RevisionDashboard, DataExportManager, AudioDebugger, InternationalizationContext, PerformanceContext, useEdnItemV2, useTypeSafeState, useDiagnosticLogs, musicService, api-client.

### Tache 3 : Corriger le wildcard CORS dans `med-mng-api/types.ts`
Remplacer `'*'` par `'https://med-mng.lovable.app'` et ajouter les headers Supabase manquants.

### Tache 4 : Garder le diagnosticLogger singleton
Wrapper `console.warn` et `console.debug` dans le singleton avec DEV guard.

---

**Estimation :** ~20 fichiers a editer, corrections mecaniques et sures.

