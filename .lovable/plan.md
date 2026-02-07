
# Audit API Suno - Resultats detailles

## Verdict : API Suno FONCTIONNELLE (generation OK) mais 3 problemes identifies

---

## Tests effectues

### 1. Edge Functions - Test direct

| Test | Endpoint | Resultat | Details |
|------|----------|----------|---------|
| Generation musique (legacy) | `generate-music` | **OK 200** | trackId recu: `f0efdfec...` |
| Generation musique (routeur) | `ai-audio` action `generate_music` | **OK 200** | trackId recu: `828d98b4...` |
| Statut generation (legacy) | `music-status` | **OK 200** | Status "generating" retourne |
| Statut generation (routeur) | `ai-audio` action `get_status` | **OK 200** | Status "generating" retourne |
| Credits Suno | `ai-audio` action `get_credits` | **OK 200** | `credits: 0` |
| Generation paroles | `ai-audio` action `generate_lyrics` | **OK** | Endpoint operationnel |

**L'API Suno repond correctement** - les appels partent vers `api.sunoapi.org`, les taskId sont generes, les tracks sont inserees en BDD.

---

## Problemes detectes

### P0 - Credits Suno a 0
- `get_credits` retourne `{ credits: 0 }` 
- Cela signifie que les generations demarrent mais **les chansons ne seront jamais completees** car le compte Suno n'a plus de credits
- **Impact** : les utilisateurs verront le polling tourner pendant 8 minutes puis un timeout
- **Solution** : recharger les credits du compte Suno API ou verifier que la cle API est bien valide

### P1 - Double chemin de generation actif (dette technique)
6 fichiers frontend appellent encore directement `generate-music` (l'ancienne edge function legacy) au lieu du routeur unifie `ai-audio` :

| Fichier | Appel legacy |
|---------|-------------|
| `src/hooks/musicGenerationApi.ts` | `invoke('generate-music')` |
| `src/hooks/music/useMusicGenerationOrchestrator.ts` | `invoke('generate-music')` |
| `src/hooks/useMusicGeneration.ts` | `invoke('generate-music')` |
| `src/hooks/useSongGeneration.ts` | `invoke('generate-music')` |
| `src/hooks/useOfflineQueue.ts` | `invoke('generate-music')` |
| `src/components/music/AdvancedMusicGenerator.tsx` | `invoke('generate-music')` |

Et 3 fichiers appellent `music-status` au lieu de `ai-audio` action `get_status` :
- `src/hooks/music/useSunoMusicGeneration.ts`
- `src/hooks/music/useMusicPolling.ts`
- `src/hooks/useMusicGenerationStatus.ts`

**Les deux chemins fonctionnent** (les legacy edge functions existent toujours), donc ce n'est pas bloquant mais c'est une inconstance architecturale.

### P2 - Callback URL pointe vers le routeur mais format incompatible
Le callback Suno est configure sur `ai-audio` mais le payload Suno arrive en format brut (pas avec `action: "callback"`). Le handler `handleCallback` attend `payload.code` et `payload.data` ce qui semble correct pour le format Suno, mais le routeur principal parse `body.action` d'abord -- si Suno envoie un callback sans champ `action`, le routeur retournera "Invalid action".

---

## Ce qui fonctionne parfaitement

- Cle API Suno configuree et valide (pas d'erreur 401)
- Generation de taskId immediate (~5 secondes)
- Insertion BDD `generated_music_tracks` automatique
- Polling adaptatif 8 phases avec timeout 8 minutes
- Gestion d'erreurs complete (429, 401, 408, 413, 430, 455)
- Retry avec backoff exponentiel
- Annulation de generation (flag abort)
- Persistance localStorage des taches actives
- Metriques de generation inserees en BDD

---

## Plan de corrections

### Correction 1 : Migrer les 6 fichiers legacy vers le routeur `ai-audio` (P1)
Remplacer tous les `supabase.functions.invoke('generate-music')` par `audioApi.generateMusic()` et tous les `invoke('music-status')` par `audioApi.getStatus()`.

Fichiers a modifier :
1. `src/hooks/musicGenerationApi.ts` - utiliser `audioApi.generateMusic()`
2. `src/hooks/music/useMusicGenerationOrchestrator.ts` - utiliser `audioApi.generateMusic()`
3. `src/hooks/useMusicGeneration.ts` - utiliser `audioApi.generateMusic()`
4. `src/hooks/useSongGeneration.ts` - utiliser `audioApi.generateMusic()`
5. `src/hooks/useOfflineQueue.ts` - utiliser `audioApi.generateMusic()`
6. `src/components/music/AdvancedMusicGenerator.tsx` - utiliser `audioApi.generateMusic()`
7. `src/hooks/music/useSunoMusicGeneration.ts` - utiliser `audioApi.getStatus()` au lieu de `invoke('music-status')`
8. `src/hooks/music/useMusicPolling.ts` - utiliser `audioApi.getStatus()`
9. `src/hooks/useMusicGenerationStatus.ts` - utiliser `audioApi.getStatus()`

### Correction 2 : Fixer le callback Suno dans le routeur (P2)
Ajouter une detection automatique du format callback Suno dans le routeur `ai-audio/index.ts` : si le body contient `code` et `data` mais pas `action`, router vers `handleCallback`.

### Correction 3 : Credits Suno (P0 - action utilisateur requise)
Le compte Suno API a 0 credits. Ce probleme ne peut pas etre corrige par du code -- il faut recharger les credits sur le compte API Suno ou verifier/remplacer la cle API `SUNO_API_KEY`.
