# Standards de Nomenclature MED-MNG

## 🎯 Principe Général

**Code en anglais, documentation en français** pour une base de code internationale avec une équipe francophone.

## 📂 Conventions par Type

### 🏗️ Architecture & Fichiers
```typescript
// ✅ CORRECT - Anglais pour le code
src/
├── components/
│   ├── admin/AdminDashboard.tsx          // PascalCase composants
│   └── common/ErrorBoundary.tsx
├── hooks/
│   ├── useAudioPlayer.ts                 // camelCase hooks
│   └── useUserQuotaSync.ts
├── services/
│   ├── musicService.ts                   // camelCase services
│   └── apiClient.ts
└── types/
    ├── MusicTypes.ts                     // PascalCase types
    └── ApiTypes.ts

// ❌ ÉVITER - Mélange FR/EN
src/hooks/useQuotaSync.ts                 // → useUserQuotaSync.ts
scripts/lancer-diagnostic.js             // → scripts/diagnostic-runner.js
```

### 🔤 Variables & Fonctions
```typescript
// ✅ CORRECT - Anglais descriptif
const userQuotaData = await fetchQuota();
const musicGenerationRequest: MusicRequest = {};
function generateAudioTrack(params: AudioParams) {}
interface MusicGenerationResponse {}
type UserSubscriptionStatus = 'active' | 'pending' | 'expired';

// ❌ ÉVITER - Français ou mixte
const donneesQuota = ...;                 // → userQuotaData
const requestMusique = ...;               // → musicGenerationRequest
function genererMusique() {}              // → generateMusic()
```

### 📝 Commentaires & Documentation
```typescript
// ✅ CORRECT - Français pour l'équipe
/**
 * Génère une piste musicale à partir des paramètres EDN
 * @param ednData - Données extraites de la compétence
 * @param options - Options de génération musicale
 * @returns Promise avec l'URL de la piste générée
 */
async function generateMusicTrack(
  ednData: EdnCompetence,      // ← Types en anglais
  options: GenerationOptions
): Promise<MusicTrackResponse> {
  // Validation des paramètres d'entrée
  if (!ednData.competences?.length) {
    throw new Error('Aucune compétence trouvée dans les données EDN');
  }
  
  // Appel à l'API Suno avec retry automatique
  const musicTrack = await sunoApiClient.generate({
    prompt: buildPromptFromEdn(ednData),
    style: options.musicStyle || 'educational'
  });
  
  return musicTrack;
}
```

## 🎨 Composants React

### 📦 Nommage Composants
```typescript
// ✅ CORRECT - PascalCase descriptif anglais
export const AdminDashboard: React.FC = () => {};
export const MusicGenerationPanel: React.FC<Props> = () => {};
export const UserQuotaDisplay: React.FC = () => {};

// Props en anglais avec JSDoc français
interface MusicPlayerProps {
  /** URL de la piste audio à lire */
  audioUrl: string;
  /** Callback appelé en fin de lecture */
  onTrackEnd?: () => void;
  /** Mode de lecture (normal/karaoké) */
  playbackMode: 'normal' | 'karaoke';
}
```

### 🏷️ Classes CSS & Styles
```typescript
// ✅ CORRECT - Classes cohérentes
const styles = {
  container: 'flex flex-col gap-4 p-6',
  title: 'text-2xl font-bold text-foreground',
  button: 'bg-primary text-primary-foreground hover:bg-primary/90',
  errorState: 'border-destructive text-destructive-foreground'
};

// ❌ ÉVITER - Mélange français
const styles = {
  conteneur: '...',                       // → container
  titre: '...',                          // → title  
  boutonPrimary: '...',                  // → primaryButton
};
```

## 🔧 Services & Utilities

### 📡 API & Services
```typescript
// ✅ CORRECT - Noms explicites
class MusicGenerationService {
  async generateTrack(request: MusicRequest): Promise<MusicResponse> {}
  async getTrackStatus(trackId: string): Promise<TrackStatus> {}
}

class UserSubscriptionService {
  async getCurrentQuota(userId: string): Promise<QuotaData> {}
  async upgradeSubscription(planId: string): Promise<SubscriptionResult> {}
}

// ❌ ÉVITER - Noms français
class ServiceMusique {}                   // → MusicService
class GestionQuota {}                     // → QuotaManagementService
```

### 🛠️ Hooks Personnalisés
```typescript
// ✅ CORRECT - Préfixe 'use' + description anglaise
export function useAudioPlayer(audioUrl: string) {}
export function useUserQuotaSync(userId: string) {}
export function useMusicGeneration() {}
export function useUnifiedErrorHandling() {}

// ❌ ÉVITER - Noms mixtes
export function useGestionAudio() {}      // → useAudioManagement
export function useSyncQuota() {}         // → useQuotaSync
```

## 📄 Documentation & README

### 📚 Structure Documentation
```markdown
# ✅ CORRECT - Français pour les utilisateurs
# Guide d'Installation MED-MNG

## 🚀 Démarrage Rapide
1. Cloner le repository
2. Installer les dépendances : `npm install`
3. Configurer les variables d'environnement
4. Lancer le serveur : `npm run dev`

## 🏗️ Architecture
Le projet utilise une architecture modulaire avec :
- **Frontend** : React + TypeScript + Tailwind
- **Backend** : Supabase Edge Functions
- **Base de données** : PostgreSQL avec RLS
```

### 📖 Commentaires JSDoc
```typescript
/**
 * Hook pour gérer la lecture audio avec contrôles avancés
 * 
 * @example
 * ```tsx
 * function MusicPlayer() {
 *   const { play, pause, isPlaying } = useAudioPlayer(audioUrl);
 *   
 *   return (
 *     <button onClick={isPlaying ? pause : play}>
 *       {isPlaying ? 'Pause' : 'Lecture'}
 *     </button>
 *   );
 * }
 * ```
 * 
 * @param audioUrl - URL de la piste audio à lire
 * @param options - Options de configuration du lecteur
 * @returns Contrôles et état du lecteur audio
 */
export function useAudioPlayer(
  audioUrl: string, 
  options?: AudioPlayerOptions
): AudioPlayerControls {
  // Implémentation...
}
```

## ✅ Checklist Validation

### 🔍 Avant Commit
- [ ] Noms de fichiers en anglais
- [ ] Variables et fonctions en anglais
- [ ] Commentaires en français (équipe locale)
- [ ] Types et interfaces en anglais
- [ ] Documentation utilisateur en français
- [ ] Pas de mélange FR/EN dans le même contexte

### 🎯 Critères de Review
- **Cohérence** : Respect des conventions établies
- **Clarté** : Noms explicites et non ambigus  
- **Maintenabilité** : Nommage facilitant la recherche
- **Internationalisation** : Code réutilisable par équipes non-francophones

Cette standardisation améliore la qualité du code et facilite la collaboration sur le projet MED-MNG.