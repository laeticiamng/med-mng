
# MED MNG - Plateforme d'Apprentissage Médical par IA Musicale

## 🎵 Vue d'ensemble

MED MNG est une plateforme révolutionnaire qui transforme l'apprentissage médical grâce à l'intelligence artificielle musicale. Elle permet aux étudiants et professionnels de santé de créer des contenus pédagogiques musicaux personnalisés, facilitant la mémorisation et l'apprentissage des concepts médicaux complexes.

## 🚀 Fonctionnalités principales

### 🎼 Génération musicale intelligente
- **Création de chansons personnalisées** : Transformez vos contenus pédagogiques en musiques mémorables
- **Styles musicaux variés** : Pop, Rock, Classique, Électro, Reggae, et bien plus
- **Paroles intégrées** : Génération automatique de paroles chantées basées sur le contenu médical
- **Durées personnalisables** : De 1 à 6 minutes selon vos besoins

### 📚 Système de bibliothèque
- **Sauvegarde automatique** : Toutes vos créations sont automatiquement ajoutées à votre bibliothèque
- **Gestion des favoris** : Système de likes pour organiser vos contenus préférés
- **Recherche avancée** : Trouvez rapidement vos contenus par titre, style ou métadonnées
- **Streaming sécurisé** : Lecture en continu avec URLs sécurisées

### 🎯 Contenus pédagogiques EDN
- **Items EDN complets** : IC1 à IC5 avec contenus détaillés
- **Rangs A et B** : Tableaux comparatifs et contenus spécialisés
- **Scènes immersives** : Expériences d'apprentissage interactives
- **Quiz intégrés** : Évaluations et interactions pédagogiques

### 🔐 Système d'authentification
- **Comptes sécurisés** : Authentification via Supabase Auth
- **Profils utilisateurs** : Gestion des informations personnelles
- **Comptes de test** : Accès illimité pour les démonstrations

### 💳 Gestion des abonnements
- **Plan Standard** : 60 crédits/mois
- **Plan Pro** : 2500 crédits/mois  
- **Plan Premium** : 5000 crédits/mois
- **Intégration Stripe/PayPal** : Paiements sécurisés

## 🏗️ Architecture technique

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── med-mng/              # Composants spécifiques MED MNG
│   │   ├── create/           # Interface de création
│   │   ├── library/          # Bibliothèque musicale
│   │   └── auth/            # Authentification
│   ├── edn/                 # Composants EDN
│   │   ├── music/           # Génération musicale
│   │   ├── tableau/         # Tableaux pédagogiques
│   │   └── immersive/       # Scènes immersives
│   └── ui/                  # Composants UI réutilisables
├── hooks/                   # Hooks personnalisés
├── contexts/               # Contextes React
└── pages/                  # Pages principales
```

### Backend (Supabase)
```
supabase/
├── migrations/             # Migrations SQL
├── functions/             # Edge Functions
│   ├── med-mng-api/       # API principale MED MNG
│   ├── generate-music/    # Génération musicale
│   └── send-emails/       # Envoi d'emails
└── config.toml           # Configuration Supabase
```

### Base de données
- **Tables principales** :
  - `med_mng_songs` : Chansons générées
  - `med_mng_user_songs` : Bibliothèque utilisateur
  - `med_mng_subscriptions` : Abonnements
  - `med_mng_song_likes` : Système de likes
  - `profiles` : Profils utilisateurs
  - `edn_items_complete` : Contenus EDN

## 🛠️ Installation et développement

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase
- Clés API (Suno, OpenAI, Resend)

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd med-mng

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Voir section "Configuration" ci-dessous

# Lancer en développement
npm run dev
```

### Configuration des secrets Supabase
Dans les paramètres Supabase Functions, configurez :
- `SUNO_API_KEY` : Clé API Suno pour la génération musicale
- `OPENAI_API_KEY` : Clé API OpenAI pour l'IA
- `RESEND_API_KEY` : Clé API Resend pour les emails
- `SUPABASE_SERVICE_ROLE_KEY` : Clé de service Supabase

## 🔧 Fonctions Supabase

### Fonctions principales (préfixe `med_mng_`)
- `med_mng_create_user_sub()` : Création d'abonnements
- `med_mng_get_remaining_quota()` : Vérification du quota
- `med_mng_add_to_library()` : Ajout à la bibliothèque
- `med_mng_toggle_like()` : Gestion des likes
- `med_mng_handle_new_user()` : Gestion nouveaux utilisateurs
- `med_mng_log_user_activity()` : Logging des activités
- `med_mng_get_activity_stats()` : Statistiques d'usage

### Edge Functions
- `med-mng-api` : API principale avec routing
- `generate-music` : Génération musicale via Suno
- `send-emails` : Envoi d'emails de bienvenue

## 🎨 Composants clés

### Génération musicale
```typescript
// Hook principal pour la génération
const { generateMusicInLanguage } = useMedMngMusicGeneration();

// Générer une chanson
await generateMusicInLanguage('A', paroles, 'pop', 240, 'IC1');
```

### Bibliothèque musicale
```typescript
// Hook pour la bibliothèque
const { library, addToLibrary, removeFromLibrary } = useMusicLibrary();
```

### API MED MNG
```typescript
// Client API
const medMngApi = useMedMngApi();

// Créer une chanson
const song = await medMngApi.createSong(title, sunoAudioId, metadata);

// Obtenir l'URL de streaming
const streamUrl = medMngApi.getSongStreamUrl(songId);
```

## 🎵 Intégration Suno AI

### Génération musicale
- **Endpoint** : `https://apibox.erweima.ai/api/v1/generate`
- **Paramètres** :
  - `prompt` : Paroles de la chanson
  - `style` : Style musical
  - `custom_mode` : Mode personnalisé
  - `instrumental` : Avec ou sans voix
  - `wait_audio` : Attendre l'audio

### Streaming audio
- **Endpoint** : `https://apibox.erweima.ai/api/v1/audio/{audio_id}`
- **Proxy sécurisé** : Via l'API MED MNG
- **Support Range** : Streaming progressif

## 📧 Système d'emails

### Templates disponibles
- `welcome` : Email de bienvenue
- `subscription_success` : Confirmation d'abonnement

### Variables de template
```json
{
  "name": "Nom utilisateur",
  "email": "Email utilisateur", 
  "plan_name": "Nom du plan",
  "app_url": "URL de l'application"
}
```

## 🔒 Sécurité et authentification

### Row Level Security (RLS)
- Toutes les tables sensibles protégées par RLS
- Politiques basées sur `auth.uid()`
- Accès limité aux données de l'utilisateur connecté

### Authentification
```typescript
// Vérification d'authentification
const { data: { user } } = await supabase.auth.getUser();

// Middleware d'authentification
const { error, supabase, user } = await validateAuth(req);
```

## 📊 Analytics et logging

### Logging des activités
```sql
-- Logger une activité
SELECT med_mng_log_user_activity(
  'song_created',
  '{"platform": "med-mng", "style": "pop"}'::jsonb
);
```

### Statistiques
```sql
-- Obtenir les statistiques
SELECT * FROM med_mng_get_activity_stats(
  '2024-01-01'::timestamptz,
  '2024-12-31'::timestamptz
);
```

## 🚀 Déploiement

### Déploiement Lovable
1. Cliquer sur "Publish" dans l'interface Lovable
2. Configurer le domaine personnalisé si nécessaire
3. Vérifier les variables d'environnement

### Déploiement manuel
```bash
# Build de production
npm run build

# Déployer sur votre plateforme
# (Vercel, Netlify, etc.)
```

## 🐛 Debugging et monitoring

### Logs Supabase Functions
- Accéder aux logs : Dashboard Supabase > Functions > Logs
- Monitoring des erreurs et performances
- Debugging des appels API

### Console logging
```typescript
console.log('🎵 Génération musicale démarrée:', { rang, style });
console.error('❌ Erreur:', error);
```

## 📝 Contribution

### Structure du code
- Utiliser TypeScript strict
- Suivre les conventions de nommage
- Documenter les fonctions complexes
- Tester les fonctionnalités critiques

### Conventions de nommage
- **Fonctions Supabase** : `med_mng_*`
- **Composants** : PascalCase
- **Hooks** : `use*`
- **Types** : PascalCase avec suffixe `Type` ou `Interface`

## 🆘 Support et FAQ

### Erreurs communes
1. **Quota épuisé** : Vérifier l'abonnement utilisateur
2. **Génération échouée** : Vérifier la clé API Suno
3. **Authentification** : Vérifier les tokens et sessions

### Contact
- Email : support@medmng.com
- Documentation : [docs.medmng.com](https://docs.medmng.com)

## 📄 Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Équipe** : MED MNG Development Team
