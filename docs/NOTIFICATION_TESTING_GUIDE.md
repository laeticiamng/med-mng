# 🔔 Guide de Test des Notifications en Temps Réel

## ✅ Vérification de l'Installation

### Composants Installés
- ✅ **Table** : `share_notifications` avec RLS policies
- ✅ **Triggers** : `on_share_created`, `on_share_updated`, `on_share_deleted`
- ✅ **Realtime** : Activé sur `sitemap_shares` et `share_notifications`
- ✅ **Hook** : `useShareNotifications` pour gérer les notifications
- ✅ **UI** : `ShareNotificationsPanel` dans la navigation
- ✅ **Page de test** : `/share-test` disponible

## 🧪 Procédure de Test Complète

### Étape 1 : Préparation (2 utilisateurs requis)

#### Utilisateur 1 (Créateur)
1. Se connecter à l'application
2. Aller sur `/share-test`
3. Garder la page ouverte

#### Utilisateur 2 (Destinataire)
1. Se connecter avec un compte différent
2. Aller sur n'importe quelle page avec la navigation
3. Observer l'icône de notification (cloche) en haut à droite

### Étape 2 : Test de Création de Partage

#### Utilisateur 1
1. Sur `/share-test`, aller dans l'onglet **"Gestion des Partages"**
2. Cliquer sur **"Créer un nouveau partage"**
3. Remplir le formulaire :
   - **Email** : Email de l'utilisateur 2
   - **Permission** : Sélectionner "viewer", "editor" ou "admin"
   - **Sitemap ID** : Laisser l'ID généré automatiquement
4. Cliquer sur **"Créer le partage"**

#### Utilisateur 2 - Vérification Attendue
- ⚡ **Notification instantanée** : Badge rouge avec "1" sur l'icône cloche
- 📬 **Toast notification** : Message en bas à droite
- 🔔 **Panel de notifications** : Cliquer sur la cloche pour voir :
  ```
  📤 Nouveau partage créé
  [Créateur] a partagé des données avec vous (permission: viewer/editor/admin)
  il y a quelques secondes
  ```

### Étape 3 : Test de Modification de Permission

#### Utilisateur 1
1. Dans la liste "Mes partages"
2. Trouver le partage créé
3. Cliquer sur **"Modifier"**
4. Changer la permission (ex: viewer → editor)
5. Confirmer

#### Utilisateur 2 - Vérification Attendue
- ⚡ **Nouvelle notification instantanée**
- 🔔 **Panel de notifications** :
  ```
  🔄 Permission modifiée
  Vos permissions ont été modifiées de viewer à editor
  il y a quelques secondes
  ```

### Étape 4 : Test de Suppression de Partage

#### Utilisateur 1
1. Cliquer sur **"Supprimer"** sur le partage
2. Confirmer la suppression

#### Utilisateur 2 - Vérification Attendue
- ⚡ **Notification instantanée**
- 🔔 **Panel de notifications** :
  ```
  ❌ Partage supprimé
  Un partage a été révoqué
  il y a quelques secondes
  ```

## 🎯 Points de Vérification

### Fonctionnalités du Panel de Notifications

1. **Badge de compteur** : Affiche le nombre de notifications non lues
2. **Notifications groupées** : Toutes les notifications visibles
3. **Indicateur non lu** : Barre bleue à gauche des notifications non lues
4. **Actions disponibles** :
   - ✅ Marquer comme lu (individuellement)
   - ✅ Marquer tout comme lu
   - 🗑️ Supprimer une notification
5. **Horodatage** : Temps relatif en français (il y a X minutes/heures)
6. **Icônes par type** :
   - 📤 Share2 (bleu) : Nouveau partage
   - 🔄 Edit/Eye/Shield (selon permission) : Modification
   - ❌ X (rouge) : Suppression

### Comportement en Temps Réel

- ⚡ **Latence** : Notification reçue en < 1 seconde
- 🔄 **Auto-refresh** : Liste mise à jour automatiquement
- 💾 **Persistence** : Notifications conservées après rafraîchissement
- 🎨 **Animation** : Toast animé en bas à droite

## 🐛 Débogage

### Console du Navigateur

Ouvrir les DevTools (F12) et vérifier :

```javascript
// Messages attendus :
"New notification received:" { type: "share_created", ... }
"Notification subscribed successfully"
```

### Requêtes Réseau

Onglet Network → WS (WebSocket) :
- ✅ Connexion établie à Supabase Realtime
- ✅ Messages `INSERT` reçus pour les nouvelles notifications

### Base de Données

Vérifier dans Supabase Dashboard :
- **Table** : `share_notifications`
- **Colonnes** : Chaque notification créée apparaît avec :
  - `notification_type` : share_created, permission_changed, share_deleted
  - `read` : false au début, true après marquage
  - `metadata` : JSON avec détails du partage

## ✅ Checklist de Test Complète

- [ ] Connexion de 2 utilisateurs différents
- [ ] Utilisateur 1 crée un partage vers utilisateur 2
- [ ] Utilisateur 2 reçoit notification instantanée
- [ ] Badge de compteur s'incrémente
- [ ] Toast apparaît en bas à droite
- [ ] Panel affiche la notification avec icône et message
- [ ] Utilisateur 1 modifie la permission
- [ ] Utilisateur 2 reçoit nouvelle notification
- [ ] Utilisateur 1 supprime le partage
- [ ] Utilisateur 2 reçoit notification de suppression
- [ ] Utilisateur 2 peut marquer comme lu
- [ ] Badge de compteur décrémente
- [ ] Utilisateur 2 peut supprimer une notification
- [ ] "Marquer tout comme lu" fonctionne
- [ ] Notifications persistent après rafraîchissement

## 📊 Résultats Attendus

| Action | Notification Type | Icône | Couleur | Délai |
|--------|------------------|-------|---------|-------|
| Création | `share_created` | 📤 Share2 | Bleu | < 1s |
| Modification | `permission_changed` | 🛡️/📝/👁️ | Jaune | < 1s |
| Suppression | `share_deleted` | ❌ X | Rouge | < 1s |

## 🔧 Dépannage

### Notifications non reçues
1. Vérifier la connexion Realtime dans Network → WS
2. Vérifier que l'utilisateur est authentifié
3. Vérifier les triggers dans Supabase Dashboard
4. Consulter les logs de la console

### Badge ne s'actualise pas
1. Vérifier `useShareNotifications` hook
2. Vérifier la query invalidation
3. Rafraîchir la page

### Erreurs RLS
1. Vérifier les policies sur `share_notifications`
2. Vérifier l'authentification de l'utilisateur
3. Consulter les logs Supabase

## 🎉 Système Opérationnel Si...

- ✅ Notifications reçues en < 1 seconde
- ✅ Badge compte correct des non lues
- ✅ Panel affiche toutes les notifications
- ✅ Actions (marquer lu, supprimer) fonctionnent
- ✅ Persistence après rafraîchissement
- ✅ WebSocket connecté (Network → WS)

---

**Dernière mise à jour** : 2025-11-13  
**Version** : 1.0.0
