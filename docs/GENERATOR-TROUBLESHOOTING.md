# 🔧 Guide de Dépannage - Générateur Musical

## 🚨 Problèmes Courants

### 1. La génération ne démarre pas

#### Symptômes
- Bouton "Générer Musique" grisé
- Aucune réaction au clic
- Message d'erreur immédiat

#### Causes Possibles

**A. Champs manquants**
```
✅ Solution :
1. Vérifier que TOUS les champs sont remplis :
   - Type de contenu (EDN/ECOS/OIC)
   - Item sélectionné
   - Rang (pour EDN)
   - Style musical
2. Regarder si des champs sont en rouge
3. Lire le message d'erreur affiché
```

**B. Session expirée**
```
✅ Solution :
1. Déconnexion/Reconnexion
2. Actualiser la page (F5)
3. Vider le cache (Ctrl+Shift+Del)
```

**C. Quota atteint**
```
✅ Solution :
1. Vérifier votre quota : `/profile`
2. Attendre le renouvellement mensuel
3. Upgrader vers Premium
```

---

### 2. Génération trop longue (> 5 min)

#### Symptômes
- Barre "Génération en cours..." depuis > 5 min
- Pas de progression visible
- Statut bloqué

#### Diagnostic

**A. Vérifier le statut réel**
```typescript
// Via console navigateur (F12)
// 1. Ouvrir l'onglet Console
// 2. Copier/coller :
const checkStatus = async () => {
  const { data } = await supabase.functions.invoke('music-status', {
    body: { taskId: 'VOTRE_TASK_ID' }
  });
  console.log('Status:', data);
};
checkStatus();
```

**B. Causes possibles**

1. **Surcharge API Suno**
   ```
   ✅ Solution :
   - Attendre 10 minutes
   - Réessayer avec un autre style
   - Contacter support si récurrent
   ```

2. **Problème réseau**
   ```
   ✅ Solution :
   - Vérifier connexion internet
   - Tester sur autre réseau
   - Désactiver VPN/Proxy
   ```

3. **Erreur backend**
   ```
   ✅ Solution :
   - Consulter `/monitoring` pour voir statut système
   - Vérifier les logs Supabase (admin)
   - Signaler le taskId au support
   ```

---

### 3. L'audio ne se lit pas

#### Symptômes
- Lecteur affiché mais pas de son
- Erreur "Failed to load audio"
- Lecteur grisé/désactivé

#### Diagnostic Étape par Étape

**Étape 1 : Vérifier le volume**
```
□ Volume navigateur > 0
□ Volume système > 0
□ Aucun mode silencieux actif
□ Casque/Écouteurs branchés correctement
```

**Étape 2 : Tester l'URL audio**
```typescript
// Console navigateur (F12)
const testAudio = new Audio('URL_AUDIO_ICI');
testAudio.play()
  .then(() => console.log('✅ Audio OK'))
  .catch(err => console.error('❌ Erreur:', err));
```

**Étape 3 : Vérifier les bloqueurs**
```
✅ Actions :
1. Désactiver bloqueur de publicités
2. Désactiver extensions audio
3. Tester en navigation privée
4. Essayer autre navigateur
```

**Étape 4 : Problème CORS/Sécurité**
```
Console : "blocked by CORS policy"
✅ Solution :
- L'URL audio est peut-être expirée
- Régénérer la musique
- Contacter support si persistant
```

---

### 4. Qualité audio mauvaise

#### Symptômes
- Son distordu/crachotant
- Volume faible
- Coupures audio

#### Solutions par Cause

**A. Connexion internet faible**
```
✅ Solutions :
- Passer sur WiFi (au lieu de 3G/4G)
- Se rapprocher du routeur
- Fermer autres onglets/apps
- Télécharger pour écoute hors ligne
```

**B. Navigateur non optimisé**
```
✅ Solutions recommandées :
1. Chrome/Edge : Meilleure compatibilité
2. Firefox : Bon support audio
3. Safari : OK mais parfois lent
❌ Éviter : Navigateurs mobiles anciens
```

**C. Format audio incompatible**
```
Console : "codec not supported"
✅ Solution :
- Mettre à jour le navigateur
- Essayer autre navigateur
- Signaler problème au support
```

---

### 5. Erreur "RLS Policy Violation"

#### Symptômes
```
Error: new row violates row-level security policy
```

#### Cause
Tentative d'insertion/modification sans autorisation.

#### Solutions

**A. Non connecté**
```
✅ Solution :
1. Se connecter : `/login`
2. Vérifier session active
3. Recharger page après connexion
```

**B. Session expirée**
```
✅ Solution :
1. Déconnexion
2. Reconnexion
3. Régénérer
```

**C. Problème technique**
```
✅ Solution :
- Contacter support avec :
  - Capture d'écran erreur
  - TaskId concerné
  - Heure de l'erreur
```

---

### 6. Métriques ne s'affichent pas (`/monitoring`)

#### Symptômes
- Page blanche
- "Erreur de chargement"
- Données vides

#### Diagnostic

**A. Table monitoring non créée**
```sql
-- Vérifier (Admin uniquement)
SELECT COUNT(*) FROM music_generation_metrics;

-- Si erreur "relation does not exist"
✅ Solution : Contacter admin pour créer la table
```

**B. Permissions insuffisantes**
```
✅ Solution :
- Vérifier RLS policies
- Se reconnecter
- Contacter support
```

**C. Aucune donnée**
```
✅ Normal si :
- Aucune génération dans les 30 derniers jours
- Compte nouveau
- Base de données purgée
```

---

## 🔍 Outils de Diagnostic

### Console Navigateur (F12)

**Vérifier erreurs JavaScript**
```javascript
// Ouvrir Console
// Regarder messages en rouge
// Copier et envoyer au support si besoin
```

**Vérifier requêtes réseau**
```javascript
// Onglet "Network" (Réseau)
// Filtrer "Fetch/XHR"
// Regarder statut (200 = OK, 4xx/5xx = Erreur)
// Clic droit > Copy > Copy as cURL
```

### Logs Edge Functions (Admin)

```bash
# Via Supabase CLI
supabase functions logs generate-music --follow

# Avec filtre
supabase functions logs generate-music --filter "ERROR|taskId=abc123"

# Dernier logs
supabase functions logs generate-music --tail 100
```

### Database Queries (Admin)

```sql
-- Vérifier statut génération
SELECT 
  track_id,
  status,
  initiated_at,
  completed_at,
  error_message
FROM music_generation_metrics
WHERE track_id = 'VOTRE_TASK_ID';

-- Dernières générations
SELECT 
  track_id,
  status,
  created_at,
  duration_seconds
FROM music_generation_metrics
ORDER BY created_at DESC
LIMIT 10;

-- Générations échouées récentes
SELECT 
  track_id,
  error_message,
  created_at
FROM music_generation_metrics
WHERE status IN ('failed', 'timeout')
  AND created_at >= now() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## 📊 Codes d'Erreur

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| **SUNO_001** | Quota API dépassé | Limite Suno atteinte | Attendre ou upgrade |
| **SUNO_002** | Prompt trop long | > 5000 caractères | Réduire texte |
| **SUNO_003** | Style invalide | Style non reconnu | Choisir style liste |
| **AUTH_001** | Non authentifié | Session expirée | Se reconnecter |
| **AUTH_002** | Token invalide | JWT corrompu | Vider cache + reconnecter |
| **RLS_001** | RLS violation | Permission refusée | Vérifier user_id |
| **NET_001** | Timeout réseau | Connexion lente | Vérifier internet |
| **NET_002** | API indisponible | Supabase down | Consulter status page |

---

## 🆘 Escalade Support

### Niveau 1 : Auto-diagnostic (5 min)

1. Consulter cette page
2. Vérifier connexion internet
3. Tester en navigation privée
4. Actualiser page (F5)

### Niveau 2 : Recherche FAQ (10 min)

1. Consulter FAQ : `/help`
2. Chercher sur forum communauté
3. Vérifier status page : `/platform-status`

### Niveau 3 : Support Technique (24-48h)

**Informations à fournir :**

```markdown
## 🐛 Rapport de Bug

### Informations Utilisateur
- Email : votre@email.com
- Navigateur : Chrome 120.0.0
- OS : Windows 11 / macOS 14 / Linux
- Date/Heure : 2025-10-29 14:30 UTC

### Description du Problème
[Décrire précisément le problème]

### Étapes pour Reproduire
1. Aller sur /generator
2. Sélectionner EDN > IC-290 > Rang A > Lofi
3. Cliquer "Générer"
4. Erreur apparaît après 30s

### Erreur Affichée
```
Error: Failed to generate music
TaskId: abc-123-def-456
```

### Captures d'Écran
[Joindre captures si possible]

### Logs Console
[Copier logs console F12 si demandé]

### Actions Déjà Tentées
- [x] Actualiser page
- [x] Navigation privée
- [ ] Autre navigateur
- [x] Vider cache
```

**Canaux Support :**

- **Email** : support@med-mng.com
- **Chat** : Bouton "Support" en bas à droite
- **Discord** : #support-technique
- **Urgent** : Tel +33 X XX XX XX XX (Premium uniquement)

---

## 🔄 Procédures de Récupération

### Récupération Génération Bloquée

```typescript
// 1. Récupérer le taskId
const taskId = localStorage.getItem('currentTaskId');

// 2. Forcer vérification statut
const { data } = await supabase.functions.invoke('music-status', {
  body: { taskId, forceCheck: true }
});

// 3. Si completed, récupérer audio
if (data.status === 'completed') {
  const audioUrl = data.audioUrl;
  // Afficher lecteur manuellement
}

// 4. Si failed, réinitialiser
if (data.status === 'failed') {
  localStorage.removeItem('currentTaskId');
  // Régénérer
}
```

### Reset Complet Application

```javascript
// ⚠️ Utiliser en dernier recours
// Perte de tous les états locaux

// 1. Vider localStorage
localStorage.clear();

// 2. Vider sessionStorage
sessionStorage.clear();

// 3. Vider cache Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(registrations => {
      registrations.forEach(reg => reg.unregister());
    });
}

// 4. Vider cache navigateur
// Chrome: Ctrl+Shift+Del > "Cached images and files"

// 5. Redémarrer navigateur

// 6. Reconnecter à MED-MNG
```

---

## 📚 Ressources

- [Guide Utilisateur](./GENERATOR-USER-GUIDE.md)
- [Documentation Technique](./GENERATOR-TECHNICAL-DOCS.md)
- [FAQ](./FAQ.md)
- [Status Page](https://status.med-mng.com)
- [Community Forum](https://forum.med-mng.com)

---

**Guide de dépannage mis à jour le 2025-10-29** 🔧✨
