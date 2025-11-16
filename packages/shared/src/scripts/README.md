
# Scripts d'Audit EDN Items

Ce dossier contient les scripts pour auditer la conformité des items EDN au schéma v2.

## Scripts disponibles

### auditItems.ts

Script principal d'audit qui vérifie :
- **Conformité schéma v2** : Validation avec Zod selon `itemEDNSchema.ts`
- **Complétude des données** : Présence des rangs A/B, paroles musicales, configuration
- **Cohérence des données** : Format des slugs, codes items, etc.
- **Détection de format** : Identification automatique v1/v2

## Utilisation

### Via Interface Web (Recommandé)

1. Rendez-vous sur `/audit-edn` dans votre application
2. Cliquez sur "Lancer l'audit"
3. Consultez les résultats dans le tableau de bord
4. Exportez le rapport au format JSON ou Markdown

### Via Code

```typescript
import { runAudit } from '@/scripts/auditItems';

// Exécution de l'audit
const result = await runAudit();
console.log('Rapport:', result.report);
console.log('Markdown:', result.markdown);
console.log('JSON:', result.json);
```

### Via Hook React

```typescript
import { useAuditItems } from '@/hooks/useAuditItems';

const { report, loading, error, runAudit, exportReport } = useAuditItems();

// Lancer l'audit
await runAudit();

// Exporter les résultats
exportReport('json');    // ou 'markdown'
```

## Rapport d'audit

### Structure du rapport

```typescript
interface AuditReport {
  timestamp: string;          // Date de l'audit
  totalItems: number;         // Nombre total d'items
  validItems: number;         // Items conformes v2
  invalidItems: number;       // Items non conformes
  errorItems: number;         // Items en erreur
  results: AuditResult[];     // Détail par item
}
```

### Résultat par item

```typescript
interface AuditResult {
  id: string;                 // ID Supabase
  slug: string;               // Slug de l'item
  item_code: string;          // Code (IC-1, IC-2, etc.)
  status: 'valid' | 'invalid' | 'error';
  errors: string[];           // Erreurs de validation
  warnings: string[];         // Avertissements
  isV2Format: boolean;        // Format détecté
  completeness: {             // Statut de complétude
    rangA: boolean;
    rangB: boolean;
    parolesMusicales: boolean;
    generationConfig: boolean;
  };
}
```

## Interprétation des résultats

### Statuts

- **✅ valid** : Item conforme au schéma v2, toutes les validations passent
- **⚠️ invalid** : Item non conforme, erreurs de validation présentes
- **❌ error** : Erreur lors de l'audit (problème de données ou de code)

### Complétude

- **Rang A/B** : Présence et validité des compétences par rang
- **Paroles musicales** : Existence de paroles chantables
- **Config génération** : Configuration des modules (musique, BD, quiz, etc.)

### Actions recommandées

1. **Items invalid** : Corriger les erreurs de validation listées
2. **Items en format v1** : Migrer vers le schéma v2
3. **Complétude manquante** : Ajouter les données manquantes
4. **Erreurs d'audit** : Vérifier l'intégrité des données en base

## Formats d'export

### JSON
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "totalItems": 5,
  "validItems": 3,
  "invalidItems": 2,
  "errorItems": 0,
  "results": [...]
}
```

### Markdown
```markdown
# Rapport d'Audit EDN Items

**Date:** 15/01/2024 à 11:30:00

## Résumé
- **Total items:** 5
- **Items valides:** 3 (60%)
- **Items invalides:** 2
- **Erreurs d'audit:** 0

## Détail par item
### ✅ IC-1 `v2`
- **Slug:** ic-1-relation-medecin-malade
- **Statut:** valid
- **Complétude:**
  - Rang A: ✅
  - Rang B: ✅
  - Paroles musicales: ✅
  - Config génération: ✅
```

## Dépendances

- `@supabase/supabase-js` : Accès aux données
- `zod` : Validation des schémas
- `@/schemas/itemEDNSchema` : Schéma de validation v2
- `@/parsers/ednItemParser` : Parser unifié v1/v2

## Développement

Pour étendre l'audit :

1. **Ajouter des vérifications** dans `auditSingleItem()`
2. **Modifier le rapport** via `AuditResult` interface
3. **Personnaliser l'export** dans `generateMarkdownReport()` ou `generateJSONReport()`

## Intégration CI/CD

L'audit peut être intégré dans une pipeline :

```bash
# Via npm script (à ajouter au package.json)
npm run audit-items

# Via Node.js direct
node -e "import('./src/scripts/auditItems.js').then(m => m.runAudit())"
```

---

**Note** : L'audit se base sur les données actuelles en base Supabase. Assurez-vous que la connexion est configurée avant utilisation.
```
