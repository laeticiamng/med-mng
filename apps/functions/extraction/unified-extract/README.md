# Unified Extract Edge Function

Edge function unifiée pour l'extraction et le reporting des items EDN.

## 📋 Description

Cette fonction fournit trois modes d'extraction :
1. **Single** : Extraction d'un seul item
2. **Batch** : Extraction en lot de plusieurs items
3. **Report** : Génération de rapports d'extraction

## 🚀 Utilisation

### Mode Single (par défaut)

Extraire un seul item EDN :

```bash
curl -X POST https://your-project.supabase.co/functions/v1/unified-extract \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "single",
    "itemId": "IC-001"
  }'
```

**Réponse:**
```json
{
  "success": true,
  "mode": "single",
  "itemId": "IC-001",
  "data": {
    "item_code": "IC-001",
    "titre": "Anatomie générale",
    "completeness_score": 85,
    ...
  }
}
```

---

### Mode Batch

Extraire plusieurs items en parallèle (par lots de 10) :

```bash
curl -X POST https://your-project.supabase.co/functions/v1/unified-extract \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type": application/json" \
  -d '{
    "mode": "batch",
    "itemIds": ["IC-001", "IC-002", "IC-003", "IC-004", "IC-005"]
  }'
```

**Réponse:**
```json
{
  "success": true,
  "mode": "batch",
  "stats": {
    "total": 5,
    "successful": 4,
    "failed": 1,
    "successRate": "80.00%"
  },
  "results": [
    {
      "id": "IC-001",
      "success": true,
      "data": { ... },
      "timestamp": "2025-11-14T12:00:00.000Z"
    },
    {
      "id": "IC-002",
      "success": false,
      "error": "Item not found",
      "timestamp": "2025-11-14T12:00:01.000Z"
    },
    ...
  ]
}
```

**Caractéristiques:**
- Traitement par lots de 10 items
- Exécution parallèle des requêtes
- Statistiques détaillées
- Gestion d'erreur par item

---

### Mode Report

Générer un rapport d'extraction :

#### Rapport Summary (par défaut)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/unified-extract \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "report",
    "reportType": "summary"
  }'
```

**Réponse:**
```json
{
  "success": true,
  "mode": "report",
  "report": {
    "type": "summary",
    "generated": "2025-11-14T12:00:00.000Z",
    "summary": {
      "totalItems": 367,
      "completeItems": 285,
      "incompleteItems": 82,
      "averageCompleteness": "77.65"
    }
  }
}
```

#### Rapport Detailed

Inclut les 100 dernières extractions :

```bash
curl -X POST https://your-project.supabase.co/functions/v1/unified-extract \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type": application/json" \
  -d '{
    "mode": "report",
    "reportType": "detailed"
  }'
```

**Réponse:**
```json
{
  "success": true,
  "mode": "report",
  "report": {
    "type": "detailed",
    "generated": "2025-11-14T12:00:00.000Z",
    "summary": { ... },
    "recentExtractions": [
      {
        "id": "ext_123",
        "itemCode": "IC-001",
        "status": "success",
        "error": null,
        "timestamp": "2025-11-14T11:59:00.000Z"
      },
      ...
    ]
  }
}
```

#### Rapport Errors

Ne retourne que les extractions en erreur :

```bash
curl -X POST https://your-project.supabase.co/functions/v1/unified-extract \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "report",
    "reportType": "errors"
  }'
```

---

## 📊 Paramètres

### Payload Interface

```typescript
interface Payload {
  mode?: "batch" | "single" | "report";  // Mode d'extraction (défaut: "single")
  itemIds?: string[];                     // Liste d'IDs pour mode batch
  itemId?: string;                        // ID unique pour mode single
  reportType?: "summary" | "detailed" | "errors";  // Type de rapport
}
```

### Modes

| Mode | Description | Paramètres requis |
|------|-------------|-------------------|
| `single` | Extraction d'un seul item | `itemId` ou `itemIds[0]` |
| `batch` | Extraction de plusieurs items | `itemIds[]` |
| `report` | Génération de rapport | `reportType` (optionnel) |

### Report Types

| Type | Description | Données retournées |
|------|-------------|-------------------|
| `summary` | Rapport résumé | Statistiques globales uniquement |
| `detailed` | Rapport détaillé | Stats + 100 dernières extractions |
| `errors` | Rapport d'erreurs | Stats + extractions en erreur uniquement |

---

## ⚙️ Configuration

### Variables d'environnement requises

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** Ces variables doivent être configurées dans les secrets Supabase Edge Functions.

### Configuration dans Supabase Dashboard

1. Aller dans **Settings** > **Edge Functions**
2. Ajouter les secrets :
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔧 Développement Local

### Déployer la fonction

```bash
supabase functions deploy unified-extract
```

### Tester localement

```bash
supabase functions serve unified-extract
```

Puis tester avec curl :

```bash
curl -X POST http://localhost:54321/functions/v1/unified-extract \
  -H "Content-Type: application/json" \
  -d '{"mode": "single", "itemId": "IC-001"}'
```

---

## 📝 Logs

La fonction génère des logs détaillés pour chaque mode :

**Mode Single:**
```
🔍 Starting single extraction for item: IC-001
✅ Single extraction complete for IC-001
```

**Mode Batch:**
```
🔄 Starting batch extraction for 25 items
📦 Processing batch 1/3
📦 Processing batch 2/3
📦 Processing batch 3/3
✅ Batch extraction complete: 24/25 successful
```

**Mode Report:**
```
📊 Generating summary extraction report
✅ Report generated: 367 items analyzed
```

---

## ❌ Gestion d'erreurs

### Erreurs de configuration

**Code:** 500
**Réponse:**
```json
{
  "success": false,
  "error": "Missing Supabase configuration"
}
```

**Solution:** Vérifier que `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont configurés.

---

### Item non trouvé (Mode Single)

**Code:** 404
**Réponse:**
```json
{
  "success": false,
  "error": "No rows found",
  "itemId": "IC-999"
}
```

---

### Item ID manquant (Mode Single)

**Code:** 400
**Réponse:**
```json
{
  "success": false,
  "error": "No item ID provided for single extraction"
}
```

**Solution:** Fournir `itemId` ou `itemIds` dans le payload.

---

### Erreur fatale

**Code:** 500
**Réponse:**
```json
{
  "success": false,
  "error": "Error message",
  "stack": "Error stack trace..."
}
```

---

## 🎯 Cas d'utilisation

### 1. Extraction d'item individuel

Utile pour :
- Affichage de détails d'item
- Validation de données d'un item spécifique
- Débogage

### 2. Extraction batch

Utile pour :
- Migration de données
- Synchronisation
- Export massif
- Tests de performance

### 3. Génération de rapports

Utile pour :
- Monitoring de qualité des données
- Identification d'items incomplets
- Analyse d'erreurs d'extraction
- Dashboards administratifs

---

## 🔄 Évolutions futures

- [ ] Support WebSocket pour progression en temps réel
- [ ] Cache des résultats d'extraction
- [ ] Filtres avancés pour mode batch
- [ ] Export CSV/PDF des rapports
- [ ] Webhooks pour notifications d'extraction
- [ ] Rate limiting configurable
- [ ] Retry automatique sur erreurs temporaires

---

## 📚 Références

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Deploy](https://deno.com/deploy)
- [Architecture EDN](../../docs/ANALYSE_EDN_COMPLETE_2025-11-14.md)

---

**Version:** 1.0.0
**Dernière mise à jour:** 2025-11-14
**Auteur:** Claude Code
