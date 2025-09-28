
# Contributing Guide - Items EDN

Ce guide explique comment ajouter et modifier des items EDN sur la plateforme.

## 🎯 Structure des Items v2

Chaque item EDN suit désormais un schema JSON standardisé v2 qui garantit la cohérence et permet la génération automatique de contenu.

### Schema Principal

```json
{
  "item_metadata": {
    "code": "IC-X",
    "title": "Titre officiel",
    "category": "relation_medecin_malade | valeurs_professionnelles | raisonnement_decision | qualite_securite | organisation_systeme",
    "difficulty": "A | B | AB",
    "version": "v2.0.0"
  },
  "content": {
    "rang_a": {
      "theme": "Thème du rang A",
      "competences": [...]
    },
    "rang_b": {
      "theme": "Thème du rang B", 
      "competences": [...]
    }
  },
  "generation_config": {
    "music_enabled": true,
    "bd_enabled": true,
    "quiz_enabled": true,
    "interactive_enabled": true
  }
}
```

## 🛠️ Ajouter un Nouvel Item

### 1. Création du fichier JSON

Créez un fichier `items/IC-XXX.json` avec la structure complète :

```json
{
  "item_metadata": {
    "code": "IC-42",
    "title": "Nouveau concept médical",
    "subtitle": "Sous-titre explicatif",
    "category": "relation_medecin_malade",
    "difficulty": "AB",
    "version": "v2.0.0",
    "slug": "ic-42-nouveau-concept"
  },
  "content": {
    "rang_a": {
      "theme": "Fondamentaux du nouveau concept",
      "competences": [
        {
          "competence_id": "NC_CONCEPT_1",
          "concept": "Premier concept clé",
          "definition": "Définition précise et complète du concept...",
          "exemple": "Exemple concret en situation clinique...",
          "piege": "Piège fréquent à éviter dans la pratique...",
          "mnemo": "Moyen mnémotechnique simple",
          "subtilite": "Nuance importante à retenir...",
          "application": "Application pratique en consultation...",
          "vigilance": "Point de vigilance critique...",
          "paroles_chantables": [
            "Version chantable du concept, rythmée et mémorable",
            "Autre version avec mélodie différente"
          ]
        }
      ]
    },
    "rang_b": {
      "theme": "Outils pratiques et approfondissement",
      "competences": [...]
    }
  },
  "generation_config": {
    "music_enabled": true,
    "bd_enabled": true,
    "quiz_enabled": true,
    "interactive_enabled": true
  }
}
```

### 2. Validation du Schema

Utilisez le validateur intégré :

```typescript
import { validateItemEDN } from '@/schemas/itemEDNSchema';

const validation = validateItemEDN(monItem);
if (!validation.success) {
  console.error('Erreurs:', validation.errors);
}
```

### 3. Import en Base

Utilisez le script d'import :

```bash
yarn add-item items/IC-42.json
```

## 📋 Standards de Qualité

### Compétences

Chaque compétence DOIT contenir :

- **concept** : 3-150 caractères, concept clair
- **definition** : >10 caractères, définition complète
- **exemple** : >10 caractères, exemple clinique concret
- **piege** : >10 caractères, erreur fréquente à éviter
- **mnemo** : >3 caractères, aide-mémoire simple
- **subtilite** : >10 caractères, nuance importante
- **application** : >10 caractères, utilisation pratique
- **vigilance** : >10 caractères, point d'attention critique
- **paroles_chantables** : 1-3 versions chantables du concept

### Bonnes Pratiques

1. **Clarté** : Langage médical précis mais accessible
2. **Concision** : Chaque champ doit être informatif sans être verbeux
3. **Cohérence** : Maintenir le même niveau de détail dans tout l'item
4. **Mémorisation** : Les mnémos et paroles doivent être efficaces
5. **Clinique** : Privilégier les exemples de situations réelles

## 🎵 Génération de Contenu Automatique

Une fois l'item validé et importé, la plateforme génère automatiquement :

- **Musique** : Chansons basées sur les `paroles_chantables`
- **BD** : Planches illustrant les concepts via IA
- **Quiz** : Questions à partir des définitions et pièges
- **Mode immersif** : Scénarios interactifs

## 🔧 Outils de Développement

### CLI Helper

```bash
# Créer un item vide
yarn create-item IC-42 "Titre" --category=relation_medecin_malade

# Valider un item
yarn validate-item items/IC-42.json

# Migrer un item v1 vers v2
yarn migrate-item IC-42

# Importer en base
yarn add-item items/IC-42.json --env=staging
```

### Tests

```bash
# Tests de validation
yarn test:schema

# Tests d'intégration
yarn test:items

# Tests de génération
yarn test:generation
```

## 🐛 Dépannage

### Erreurs Communes

1. **Schema invalide** : Vérifiez la structure JSON avec le validateur
2. **Compétence incomplète** : Tous les champs sont obligatoires
3. **Paroles manquantes** : Au moins une version chantable par compétence
4. **Code dupliqué** : Vérifiez l'unicité du code item

### Support

- 💬 Canal Slack `#edn-platform`
- 📧 Support technique : dev@docflemme.com
- 📚 Documentation complète : `/docs/items-edn`

## 🚀 Processus de Release

1. **Développement** : Créer l'item en local
2. **Validation** : Tests automatiques + review
3. **Staging** : Import sur environnement de test
4. **Production** : Déploiement avec monitoring

Chaque ajout d'item déclenche automatiquement la génération de contenu associé (musique, BD, quiz).
