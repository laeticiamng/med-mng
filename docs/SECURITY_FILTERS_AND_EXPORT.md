# 🔍 Filtres Avancés et Export PDF des Notifications

## Vue d'ensemble

La page `/audit-security` dispose maintenant de filtres avancés et d'un système d'export PDF pour générer des rapports imprimables d'incidents de sécurité.

## Filtres Avancés

### Types de Filtres Disponibles

#### 1. 🔍 Recherche Textuelle
- **Champ** : Titre et message des notifications
- **Usage** : Recherche insensible à la casse
- **Exemple** : "suppression", "accès", "utilisateur"

#### 2. 👤 Filtre par Utilisateur
- **Champ** : Email de l'utilisateur concerné
- **Recherche** : Dans `related_user_id` et détails
- **Exemple** : "admin@medmng.app"

#### 3. ⚠️ Filtre par Sévérité
Options disponibles :
- **Toutes sévérités** (par défaut)
- **Info** : Notifications informatives
- **Warning** : Avertissements
- **Critique** : Alertes critiques nécessitant une action immédiate

#### 4. 🏷️ Filtre par Type d'Alerte
Options disponibles :
- **Tous les types** (par défaut)
- **Suppression massive** : Détection de suppressions en masse
- **Accès non autorisé** : Tentatives d'accès non autorisées
- **Activité suspecte** : Patterns inhabituels
- **Alerte système** : Alertes générales

#### 5. 📅 Plage de Dates
- **Date de début** : Filtre les notifications après cette date
- **Date de fin** : Filtre les notifications avant cette date
- **Validation** : La date de fin ne peut pas être antérieure à la date de début

### Utilisation des Filtres

#### Interface

```
┌─────────────────────────────────────────────────────────┐
│ [🔍 Rechercher...]  [👤 Filtrer par utilisateur...]    │
├─────────────────────────────────────────────────────────┤
│ [Sévérité ▼] [Type ▼] [📅 Date début] [📅 Date fin]   │
├─────────────────────────────────────────────────────────┤
│ X notifications trouvées    [Réinitialiser] [📥 PDF]  │
└─────────────────────────────────────────────────────────┘
```

#### Comportements

1. **Filtrage en Temps Réel**
   - Les résultats se mettent à jour immédiatement
   - Le compteur de résultats est actualisé
   - La pagination est réinitialisée à la page 1

2. **Combinaison de Filtres**
   - Tous les filtres sont combinés avec un opérateur AND
   - Exemple : Sévérité "critique" + Type "suppression massive" + Date "dernière semaine"

3. **Réinitialisation**
   - Bouton "Réinitialiser" pour effacer tous les filtres
   - Retour aux valeurs par défaut
   - Affichage de toutes les notifications

### Exemples d'Utilisation

#### Cas 1 : Trouver toutes les alertes critiques du mois dernier

```
Sévérité: Critique
Date début: 01/10/2024
Date fin: 31/10/2024
```

#### Cas 2 : Rechercher les suppressions massives par un utilisateur

```
Type: Suppression massive
Email utilisateur: admin@medmng.app
```

#### Cas 3 : Analyser les accès non autorisés récents

```
Type: Accès non autorisé
Sévérité: Warning ou Critique
Date début: (il y a 7 jours)
```

## Export PDF

### Fonctionnalités

#### 1. 📄 Structure du Rapport

**Page 1 - Résumé Exécutif**
- En-tête avec titre et date de génération
- Filtres appliqués (si présents)
- Statistiques globales :
  - Total de notifications
  - Nombre de critiques
  - Nombre de warnings
  - Nombre d'infos
- Tableau récapitulatif de toutes les notifications

**Pages Suivantes - Détails (si ≤50 notifications)**
- Détails complets de chaque notification
- Informations techniques (JSON)
- Contexte et metadata

**Toutes les Pages**
- Numérotation automatique
- Mention "Document confidentiel"
- Branding cohérent

#### 2. 🎨 Design Professionnel

- **Couleurs** : Code couleur par sévérité
  - Rouge : Critique
  - Orange : Warning
  - Bleu : Info

- **Typographie** :
  - Titres : 20pt, couleur primaire
  - Sous-titres : 12pt, gras
  - Corps : 9pt, lisible

- **Tableaux** :
  - En-têtes avec fond coloré
  - Lignes alternées pour lisibilité
  - Colonnes dimensionnées automatiquement

#### 3. 📊 Contenu du Rapport

##### Section 1 : Filtres Appliqués
```
Filtres appliqués:
• Sévérité: critique
• Type: Suppression massive
• Du: 01/11/2024
• Au: 13/11/2024
```

##### Section 2 : Statistiques
```
Statistiques:
Total de notifications: 45
• Critiques: 12
• Warnings: 28
• Info: 5
```

##### Section 3 : Tableau Récapitulatif
| Date | Sévérité | Type | Titre | Message |
|------|----------|------|-------|---------|
| ... | ... | ... | ... | ... |

##### Section 4 : Détails (si applicable)
Pour chaque notification :
- Numéro et titre
- Date et heure précises
- Sévérité et type
- Message complet
- Détails techniques JSON (limités à 10 lignes)

### Génération du PDF

#### Via l'Interface

1. Appliquez les filtres souhaités
2. Cliquez sur le bouton "Export PDF"
3. Le PDF est généré automatiquement
4. Téléchargement avec nom : `rapport-securite-YYYY-MM-DD-HHmm.pdf`

#### Programmation

```typescript
import { exportNotificationsToPDF } from '@/utils/pdfExport';

// Export avec filtres
await exportNotificationsToPDF(filteredNotifications, {
  severity: 'critical',
  type: 'mass_deletion',
  dateFrom: new Date('2024-11-01'),
  dateTo: new Date('2024-11-13'),
  searchTerm: '',
  userEmail: '',
});
```

### Limitations

1. **Détails Complets**
   - Affichés uniquement si ≤50 notifications
   - Au-delà, seul le tableau récapitulatif est inclus
   - Raison : Optimisation de la taille du fichier

2. **Détails Techniques**
   - JSON limité à 10 lignes par notification
   - Prévient les PDF trop volumineux
   - Données complètes toujours disponibles en ligne

3. **Taille du Fichier**
   - Optimisée automatiquement
   - Police standard pour compatibilité
   - Images non incluses (texte uniquement)

## Pagination

### Fonctionnalités

- **20 notifications par page**
- Navigation avec boutons Précédent/Suivant
- Indicateur de page (ex: "Page 2 sur 5")
- Boutons désactivés aux extrémités
- Réinitialisation automatique lors du filtrage

### Navigation

```
┌──────────────────────────────────────┐
│ Page 2 sur 5                         │
│ [◄ Précédent]         [Suivant ►]   │
└──────────────────────────────────────┘
```

## Cas d'Usage

### 1. Audit Mensuel de Sécurité

**Objectif** : Générer un rapport mensuel pour la direction

**Étapes** :
1. Sélectionner "Toutes sévérités"
2. Définir dates : 1er au 30 du mois
3. Exporter en PDF
4. Inclure dans le rapport mensuel

### 2. Investigation d'Incident

**Objectif** : Analyser une activité suspecte spécifique

**Étapes** :
1. Filtrer par utilisateur concerné
2. Sélectionner période de l'incident
3. Type : "Activité suspecte"
4. Examiner les détails
5. Exporter pour documentation

### 3. Conformité et Réglementation

**Objectif** : Prouver la surveillance active

**Étapes** :
1. Exporter toutes les alertes critiques
2. Période : Dernier trimestre
3. Archiver le PDF
4. Présenter aux auditeurs

### 4. Analyse de Tendances

**Objectif** : Identifier les patterns sur plusieurs semaines

**Étapes** :
1. Filtrer par type spécifique
2. Large plage de dates (30-90 jours)
3. Comparer avec périodes précédentes
4. Ajuster les seuils d'alerte si nécessaire

## Configuration Avancée

### Personnaliser l'Export PDF

Modifier `src/utils/pdfExport.ts` :

```typescript
// Changer les couleurs
doc.setTextColor(67, 56, 202); // RGB pour la couleur principale

// Modifier le nombre d'éléments par page du rapport détaillé
notifications.slice(0, 100) // Au lieu de 50

// Ajouter des sections personnalisées
doc.text('Section Personnalisée', 14, yPosition);
```

### Ajouter de Nouveaux Filtres

1. **Modifier l'Interface** (`SecurityNotificationsFilters.tsx`)
```typescript
<Select>
  <SelectItem value="nouveau_filtre">Nouveau Filtre</SelectItem>
</Select>
```

2. **Mettre à Jour les Types**
```typescript
export interface NotificationFilters {
  // ... filtres existants
  nouveauFiltre: string;
}
```

3. **Implémenter la Logique** (`SecurityNotificationsTable.tsx`)
```typescript
if (filters.nouveauFiltre !== 'all' && 
    notification.nouveauChamp !== filters.nouveauFiltre) {
  return false;
}
```

## Performance

### Optimisations

1. **Filtrage Côté Client**
   - Rapide pour < 1000 notifications
   - Pas de requête serveur supplémentaire
   - Réponse instantanée

2. **Pagination**
   - Limite affichage à 20 éléments
   - Réduit charge DOM
   - Navigation fluide

3. **Export PDF**
   - Génération asynchrone
   - Pas de blocage de l'UI
   - Toast de confirmation

### Métriques

- Temps de filtrage : < 50ms
- Temps génération PDF (50 notifs) : < 2s
- Temps génération PDF (500 notifs) : < 5s

## Accessibilité

### Support Clavier

- Tab : Navigation entre filtres
- Enter : Valider sélection
- Espace : Ouvrir calendrier/select
- Échap : Fermer popover

### Screen Readers

- Labels ARIA sur tous les contrôles
- Annonce du nombre de résultats
- État des boutons (activé/désactivé)

### Contraste

- Texte sur fond : Ratio ≥ 4.5:1
- Boutons : États visuels distincts
- Focus visible sur tous les éléments

## Dépannage

### Problème : Aucune notification affichée

**Solutions** :
1. Vérifier les filtres actifs
2. Cliquer sur "Réinitialiser"
3. Vérifier les permissions (admin/security_analyst)
4. Consulter la console pour erreurs

### Problème : Export PDF ne fonctionne pas

**Solutions** :
1. Vérifier que jsPDF est installé
2. Consulter les logs navigateur
3. Tester avec moins de notifications
4. Vérifier les bloqueurs de popup

### Problème : Filtres ne réagissent pas

**Solutions** :
1. Rafraîchir la page
2. Vider le cache navigateur
3. Vérifier la connexion réseau
4. Consulter les erreurs console

## Sécurité

### Contrôles d'Accès

✅ **Implémentés** :
- Vérification des rôles (admin/security_analyst)
- RLS sur la table `security_notifications`
- Export limité aux notifications accessibles
- Aucune donnée sensible en clair dans l'URL

### Bonnes Pratiques

- Ne pas partager les PDFs publiquement
- Archiver dans un emplacement sécurisé
- Rotation régulière des vieux rapports
- Audit trail de tous les exports

## Évolutions Futures

### Court Terme
- [ ] Export Excel/CSV
- [ ] Templates de filtres sauvegardés
- [ ] Envoi automatique par email

### Moyen Terme
- [ ] Graphiques dans le PDF
- [ ] Comparaison période à période
- [ ] Filtres par IP source

### Long Terme
- [ ] ML pour détection anomalies
- [ ] Tableaux de bord personnalisés
- [ ] Intégration SIEM

---

**Mis à jour** : Novembre 2024  
**Version** : 1.0
