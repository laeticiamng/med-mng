# 🧭 Runbook – QCM & Bande Dessinée

## 🎯 Objectif
Garantir la disponibilité des extensions pédagogiques (QCM interactif et version Bande Dessinée) pour chaque item, avec sauvegarde des résultats et exports fonctionnels.

## 📦 Périmètre
- Edge function `complete-edn-content`
- Supabase : tables `quiz_sessions`, `quiz_questions`, `bd_scenarios`, `bd_assets`
- Frontend : `AdvancedQuizInteractif`, `AdvancedBandeDessinee`
- Analytics : événements `qcm_*`, `bd_generate_*`, `study_*`

## ✅ Pré-vol
1. **Quota OpenAI** : `OPENAI_API_KEY` valide (utilisé pour génération QCM).
2. **Stockage BD** : bucket `bd-assets` accessible (`supabase storage list bd-assets`).
3. **Exports** : service PDF disponible (vérifier `POST /api/export/pdf` via `curl`).
4. **RLS** : vérifier politiques `select policyname from pg_policies where tablename in ('quiz_sessions','bd_scenarios');`.

## 🔎 Monitoring
| Signal | Source | Seuil | Action |
| --- | --- | --- | --- |
| `qcm_generate_fail` | analytics dashboard | > 5% sur 1h | Vérifier OpenAI / logs function `complete-edn-content` |
| `qcm_submit` sans `qcm_complete` | Supabase | > 10 événements | Inspecter frontend (erreur de finalisation) |
| `bd_generate_fail` | logs Supabase | > 3 incidents | Vérifier prompt, quota stockage |
| Export PDF erreurs | logs `export-service` | > 2/heure | Rebasculer sur export Markdown |

## 🛠️ Procédures
### 1. Génération QCM échoue
1. Vérifier logs : `supabase functions logs complete-edn-content --tail`.
2. Si timeout OpenAI, activer mode mock `MOCK_EXTERNAL_APIS=true` et avertir produit.
3. Utiliser fallback manuel : relancer génération depuis page item (bouton « Régénérer ») ou insérer questions validées via interface admin.

### 2. Sauvegarde score impossible
1. Contrôler RLS : `select * from quiz_sessions where user_id='<uuid>'`.
2. Tester client : exécuter scénario Playwright `tests/e2e/music/music-generation.spec.ts` (section quiz) ou test manuel depuis interface.
3. Si bug UI, déployer hotfix `AdvancedQuizInteractif` (vérifier `useQuizSessions`).

### 3. Génération BD dégradée
1. Vérifier quotas stockage : `supabase storage get bd-assets --usage`.
2. Si script incomplet, relancer génération depuis page item (bouton « Relancer BD ») ou mettre à jour en base (`status='queued'`).
3. En cas de panne PDF, recommander export Markdown et créer ticket `tools/pdf-service`.

## 🔁 Gestion collections / favoris
- En cas de perte de favoris, resynchroniser via tâche cron « library:sync » ou script manuel SQL (`insert into library_favorites ...`).
- Vérifier cohérence bibliothèque : requête `select count(*) from library_items where item_id is null;` (attendu = 0).

## 📤 Communication
- **Support** : messages types disponibles dans `docs/templates/support-qcm-bd.md`.
- **Produit** : briefing quotidien si taux d'échec QCM > 3%.
- **Incident majeur** : status « Extensions pédagogiques dégradées ».

## 📚 Références
- QCM : `src/components/edn/advanced/AdvancedQuizInteractif.tsx`
- BD : `src/components/edn/advanced/AdvancedBandeDessinee.tsx`
- Bibliothèque : `src/pages/med-mng/Library.tsx`
