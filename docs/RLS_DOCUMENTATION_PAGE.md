# 📚 Page de Documentation RLS

**Date**: 2025-11-07  
**URL**: `/rls-documentation`  
**Composant**: `src/pages/RLSDocumentation.tsx`

---

## 🎯 Objectif

Page interactive de documentation des politiques Row Level Security (RLS) avec explications de sécurité pour chaque table de la base de données.

---

## ✨ Fonctionnalités

### 1. Vue d'Ensemble
- **Score de sécurité global** : Pourcentage de tables protégées
- **Statistiques clés** :
  - Tables totales dans la base
  - Tables avec policies RLS actives
  - Nombre total de policies
  - Tables sans protection

### 2. Recherche et Filtrage
- **Recherche textuelle** : Rechercher une table par nom
- **Filtres par catégorie** :
  - Toutes
  - Communication (chat, messages)
  - Bien-être (émotions, breathing)
  - Médical (clinical, health)
  - Administration (admin, audit)
  - Social (community, posts)
  - Éducation (EDN, OIC, quiz)

### 3. Affichage des Policies par Table
Pour chaque table :
- **Statut** : Icône verte (protégée) ou orange (sans policy)
- **Nombre de policies** : Badge avec le nombre total
- **Commandes supportées** : SELECT, INSERT, UPDATE, DELETE, ALL

### 4. Détails Expandables
Au clic sur une table :
- **Rationale de sécurité** : Explication du pourquoi de la protection
- **Liste des policies** avec :
  - Nom de la policy
  - Commande (SELECT/INSERT/UPDATE/DELETE)
  - Rôles autorisés (public, authenticated, service_role)
  - Condition USING (pour les lectures)
  - Condition WITH CHECK (pour les écritures)

---

## 🔧 Architecture Technique

### Fonctions Supabase Créées

#### `get_rls_policies()`
```sql
RETURNS TABLE(
  tablename text,
  policyname text,
  cmd text,
  roles text[],
  qual text,
  with_check text
)
```
Retourne toutes les policies RLS du schema public.

#### `get_rls_table_summaries()`
```sql
RETURNS TABLE(
  tablename text,
  policy_count bigint,
  commands text[]
)
```
Retourne un résumé par table avec nombre de policies et commandes.

### Hooks React

- **`useQuery`** pour récupérer les policies en temps réel
- **Caching automatique** via React Query
- **Actualisation** en arrière-plan

### Composants UI

- **Accordion** : Pour afficher/masquer les détails par table
- **Badges** : Pour les statuts et commandes
- **Cards** : Pour les statistiques et détails
- **Tabs** : Pour les filtres par catégorie
- **ScrollArea** : Pour la liste scrollable des tables

---

## 📊 Rationales de Sécurité Prédéfinis

Exemples de rationales automatiques :

| Table | Rationale |
|-------|-----------|
| `profiles` | Données personnelles utilisateur - isolation complète entre utilisateurs |
| `badges` | Récompenses personnelles - chaque utilisateur ne voit que ses propres badges |
| `chat_conversations` | Conversations privées - accès limité au propriétaire |
| `emotions` | Données émotionnelles sensibles - strictement privées |
| `emotionscare_songs` | Catalogue musical - lecture publique, écriture authentifiée |
| `edn_items_immersive` | Contenu éducatif - lecture publique, écriture restreinte |
| `oic_competences` | Référentiel compétences - lecture publique pour accès universel |
| `admin_changelog` | Logs administratifs - accès admin/service uniquement |
| `dsar_approvals` | Approbations DSAR - approbateurs voient uniquement leurs assignations |

---

## 🎨 Design System

### Couleurs Sémantiques
- **Vert** : Tables protégées, statut OK
- **Orange** : Tables sans policies, attention requise
- **Bleu** : Commande SELECT
- **Gris** : Commande INSERT
- **Outline** : Commande UPDATE
- **Rouge** : Commande DELETE

### Badges de Commandes
```tsx
const getCommandBadgeVariant = (cmd: string) => {
  switch (cmd) {
    case "SELECT": return "default";      // Bleu
    case "INSERT": return "secondary";    // Gris
    case "UPDATE": return "outline";      // Outline
    case "DELETE": return "destructive";  // Rouge
    case "ALL": return "default";         // Bleu
  }
}
```

---

## 🚀 Accès à la Page

### Via Navigation
1. Cliquer sur l'avatar utilisateur (coin haut-droit)
2. Sélectionner **"Documentation RLS"** dans le menu déroulant

### Via URL Directe
```
https://votre-domaine.com/rls-documentation
```

---

## 📱 Responsive Design

- **Desktop** : Affichage en colonnes avec sidebar de filtres
- **Mobile** : Layout adaptatif avec menu collapsible
- **Tablette** : Vue intermédiaire optimisée

---

## 🔐 Permissions Requises

- **Lecture** : Accessible à tous les utilisateurs authentifiés
- **Fonctions** : Exécutées avec `SECURITY DEFINER` et `SET search_path = public`
- **Données** : Lecture seule des métadonnées RLS (pas d'écriture)

---

## 💡 Cas d'Usage

### Pour les Développeurs
- Vérifier rapidement les policies appliquées sur une table
- Comprendre le modèle de sécurité de l'application
- Identifier les tables sans protection RLS

### Pour les Admins
- Auditer la sécurité de la base de données
- Valider que toutes les tables sensibles sont protégées
- Documenter les choix de sécurité pour l'équipe

### Pour les Auditeurs de Sécurité
- Analyser la couverture RLS
- Vérifier la cohérence des policies
- Identifier les failles potentielles

---

## 🔄 Mises à Jour Automatiques

La page se met à jour automatiquement :
- ✅ Lors de la création de nouvelles tables
- ✅ Lors de l'ajout/modification de policies
- ✅ Lors de la suppression de policies
- ✅ Lors du changement de schéma

**Refresh** : Automatique via React Query (stale time: 5 minutes)

---

## 📈 Métriques Affichées

### Score de Sécurité
```
Score = (Tables avec policies / Tables totales) × 100
```

**Exemple** : 85 tables avec policies / 92 tables totales = **92%**

### Statistiques Détaillées
- Nombre total de tables dans `public` schema
- Nombre de tables protégées par RLS
- Nombre total de policies actives
- Nombre de tables sans policies (à corriger)

---

## 🎯 Prochaines Améliorations

### Court Terme
- [ ] Export PDF de la documentation
- [ ] Recherche avancée par type de policy
- [ ] Filtres par niveau de sécurité (public/private/admin)

### Moyen Terme
- [ ] Historique des modifications de policies
- [ ] Comparaison entre environnements (dev/staging/prod)
- [ ] Tests automatisés des policies

### Long Terme
- [ ] Suggestions automatiques de policies
- [ ] Détection d'anomalies de sécurité
- [ ] Intégration CI/CD pour validation pré-déploiement

---

## 📝 Notes Techniques

### Performance
- **Optimisation** : Les fonctions SQL sont indexées sur `tablename`
- **Caching** : React Query cache les résultats pendant 5 minutes
- **Pagination** : Géré par le ScrollArea (pas de limite de tables)

### Sécurité
- **SECURITY DEFINER** : Les fonctions s'exécutent avec les privilèges du créateur
- **SET search_path** : Protection contre les attaques par injection de schéma
- **Read-only** : Aucune modification de données possible depuis la page

### Compatibilité
- ✅ PostgreSQL 12+
- ✅ Supabase (tous les plans)
- ✅ React 18+
- ✅ Navigateurs modernes (Chrome, Firefox, Safari, Edge)

---

## 🆘 Support

Pour toute question ou problème :
1. Vérifier les logs dans la console navigateur
2. Vérifier les permissions Supabase
3. Tester les fonctions SQL directement dans le SQL Editor
4. Consulter la documentation Supabase RLS

---

**✅ Documentation complète et prête à l'emploi !**
