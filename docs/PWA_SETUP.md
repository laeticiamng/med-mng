# 📱 Guide PWA (Progressive Web App)

## ✅ Configuration Complète

Votre application MED-MNG est maintenant une **PWA complète** avec :

### 🎯 Fonctionnalités Implémentées

1. **Service Worker avec Workbox**
   - Cache automatique des assets (JS, CSS, images)
   - Stratégies de cache optimisées par type de ressource
   - Fonctionnement offline

2. **Manifest PWA**
   - Installable sur mobile et desktop
   - Icônes adaptatives (192x192, 512x512)
   - Mode standalone (plein écran)

3. **Optimisation Images**
   - Support WebP avec fallback automatique
   - Lazy loading natif (`loading="lazy"`)
   - Compression et conversion automatique

4. **Page d'Installation**
   - Route `/install` dédiée
   - Détection automatique de l'installabilité
   - Guide d'installation iOS/Android

---

## 🚀 Utilisation

### Installation par les Utilisateurs

**Option 1 : Installation Automatique**
- L'utilisateur visite votre site
- Le navigateur affiche un prompt d'installation
- Cliquer sur "Installer" ou "Ajouter à l'écran d'accueil"

**Option 2 : Page d'Installation**
- Rediriger vers `/install`
- Suivre les instructions affichées
- Bouton d'installation en un clic (si supporté)

### Sur iOS (iPhone/iPad)

1. Ouvrir Safari et aller sur votre site
2. Appuyer sur le bouton **Partager** (carré avec flèche)
3. Descendre et sélectionner **"Sur l'écran d'accueil"**
4. Appuyer sur **"Ajouter"**

### Sur Android

1. Ouvrir Chrome et aller sur votre site
2. Appuyer sur le menu **⋮** (3 points)
3. Sélectionner **"Installer l'application"** ou **"Ajouter à l'écran d'accueil"**
4. Confirmer l'installation

---

## 🖼️ Gestion des Images

### Convertir les Images en WebP

```bash
# Installer Sharp (déjà dans package.json)
npm install

# Convertir toutes les images
node scripts/convert-images-to-webp.js
```

Ce script va :
- ✅ Trouver toutes les images JPG/JPEG/PNG
- ✅ Les convertir en WebP (85% qualité)
- ✅ Conserver les originaux
- ✅ Afficher les économies d'espace

### Utiliser le Composant OptimizedImage

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image';

// Utilisation basique
<OptimizedImage
  src="/images/photo.jpg"
  alt="Description détaillée"
  className="w-full h-64 object-cover"
  loading="lazy"
/>

// Avec fallback
<OptimizedImage
  src="/images/photo.jpg"
  alt="Description"
  fallbackSrc="/images/placeholder.jpg"
  onLoad={() => console.log('Chargée!')}
/>
```

**Avantages :**
- 🎯 Lazy loading natif
- 📦 Support WebP automatique avec fallback
- ⚡ Intersection Observer pour meilleure performance
- 🎨 Placeholder animé pendant le chargement

---

## 🔧 Configuration Technique

### Stratégies de Cache (Workbox)

| Type | Stratégie | Durée |
|------|-----------|-------|
| **Fonts Google** | CacheFirst | 1 an |
| **API Supabase** | NetworkFirst | 5 min |
| **Images** | CacheFirst | 30 jours |
| **Fonts locales** | CacheFirst | 1 an |

### Manifest PWA

```json
{
  "name": "MED-MNG - Plateforme d'Apprentissage Médical",
  "short_name": "MED-MNG",
  "theme_color": "#3B82F6",
  "background_color": "#0F172A",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/"
}
```

### Icônes Requises

- `pwa-192x192.png` : Icône 192x192 (splash screen)
- `pwa-512x512.png` : Icône 512x512 (écran d'accueil)
- `apple-touch-icon.png` : Icône 180x180 (iOS)
- `favicon.ico` : Favicon 32x32
- `mask-icon.svg` : Icône SVG (Safari pinned tabs)

---

## 📊 Tests et Validation

### 1. Lighthouse Audit

```bash
# Dans Chrome DevTools (F12)
Lighthouse → Progressive Web App → Generate Report
```

**Objectifs :**
- ✅ PWA Score: 100/100
- ✅ Installable: Yes
- ✅ Service Worker: Active
- ✅ Offline Capable: Yes

### 2. Test Manuel

1. **Test Installation**
   - Vérifier le prompt d'installation
   - Installer l'app
   - Lancer depuis l'écran d'accueil

2. **Test Offline**
   - Activer le mode avion
   - Naviguer dans l'app
   - Vérifier que le contenu est accessible

3. **Test Performance**
   - Temps de chargement < 2s
   - Navigation fluide
   - Images chargées progressivement

---

## 🎨 Générer les Icônes PWA

Si vous avez votre propre logo :

```bash
# Méthode 1 : Script automatique
cd public/pwa-icons
chmod +x generate-icons.sh
./generate-icons.sh votre-logo.png

# Méthode 2 : Manuel avec ImageMagick
convert logo.png -resize 192x192 pwa-192x192.png
convert logo.png -resize 512x512 pwa-512x512.png
convert logo.png -resize 180x180 apple-touch-icon.png
```

---

## 📱 Notifications Push (Optionnel)

Pour activer les notifications :

1. **Demander la permission**
```typescript
const permission = await Notification.requestPermission();
if (permission === 'granted') {
  // Envoyer des notifications
}
```

2. **Afficher une notification**
```typescript
new Notification('Nouvelle alerte!', {
  body: 'Un nouvel item EDN est disponible',
  icon: '/pwa-192x192.png',
  badge: '/badge-72x72.png',
});
```

---

## 🔍 Débogage

### Service Worker

```javascript
// Dans la console Chrome
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers actifs:', registrations);
});

// Désinscrire le SW
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
```

### Cache

```javascript
// Voir les caches
caches.keys().then(keys => console.log('Caches:', keys));

// Vider un cache
caches.delete('workbox-runtime');
```

### Manifest

Ouvrir Chrome DevTools → Application → Manifest

---

## 📈 Améliorer le Score PWA

### Score 90-95/100

Si votre score est entre 90-95, vérifiez :
- ✅ Toutes les icônes sont présentes
- ✅ Le manifest est valide
- ✅ Le Service Worker fonctionne
- ✅ La page fonctionne offline

### Score < 90/100

Points à améliorer :
1. **Performance** : Optimiser les images
2. **Accessibilité** : Ajouter alt sur images
3. **SEO** : Meta descriptions
4. **Best Practices** : HTTPS obligatoire

---

## 🎯 Checklist de Déploiement

Avant de déployer en production :

- [ ] Service Worker testé en local
- [ ] Toutes les icônes générées
- [ ] Manifest validé
- [ ] Images converties en WebP
- [ ] Test installation mobile
- [ ] Test fonctionnement offline
- [ ] Lighthouse Score PWA > 90
- [ ] HTTPS activé (obligatoire!)

---

## 🚨 Problèmes Courants

### "Service Worker not registered"

**Cause :** HTTPS non activé ou erreur dans le SW

**Solution :**
```bash
# Vérifier les erreurs dans la console
# Tester en localhost (HTTPS pas requis)
npm run dev
```

### "App not installable"

**Cause :** Manifest invalide ou icônes manquantes

**Solution :**
1. Vérifier Chrome DevTools → Application → Manifest
2. S'assurer que toutes les icônes existent
3. Tester avec Lighthouse

### "Images ne s'affichent pas offline"

**Cause :** Images non cachées par le SW

**Solution :**
- Vérifier que les images sont dans `/public`
- Utiliser le composant `<OptimizedImage />`
- Redéployer pour mettre à jour le SW

---

## 📚 Ressources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Guide](https://developer.chrome.com/docs/workbox/)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## 🎉 Résultat Final

Votre application MED-MNG est maintenant :

✅ **Installable** - Sur mobile et desktop  
✅ **Rapide** - Cache intelligent et lazy loading  
✅ **Offline** - Fonctionne sans connexion  
✅ **Optimisée** - Images WebP, performance maximale  
✅ **Professional** - Expérience native

**Score Lighthouse attendu :**
- Performance: 90+ ⚡
- PWA: 100 📱
- Accessibility: 95+ ♿
- SEO: 95+ 🔍
