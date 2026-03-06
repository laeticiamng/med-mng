

# Audit Complet MED-MNG -- Mars 2026

## Etat actuel : 7.5/10 -- Socle robuste, potentiel révolutionnaire sous-exploité

---

## A. CE QUI EXISTE ET FONCTIONNE

| Domaine | Elements | Status |
|---------|----------|--------|
| **Coeur pédagogique** | 367 items EDN, quiz, flashcards, SRS (SM-2), cas cliniques, mode examen | Solide |
| **Audio/Musique** | Génération Suno V4/V5, KaraokePlayer, mini-player persistant global (Spotify-style), paroles synchronisées, vitesse ajustable (0.5x-2x), boucle | Bon |
| **IA** | Chat GPT-4 (MedChat), RAG sur embeddings EDN, tuteur IA (composant ECNPrediction), génération de playlists personnalisées | Partiel |
| **Parcours guidés** | Système par spécialité avec progression linéaire, checkpoints, certification (`/parcours`) -- 10 spécialités | Nouveau |
| **Gamification** | XP, streaks, badges, leaderboard, daily challenges, achievements | Bon |
| **Social** | CommunityHub (forum, commentaires, messages directs, partage) | UI existe |
| **PWA/Offline** | OfflineModeManager, OfflineIndicator, push notifications (basiques), PWA Analytics | Squelette |
| **Admin** | Dashboard, audit, extraction, monitoring, sécurité, migration | Complet |
| **UX** | Design Apple-style, onboarding anti-anxiété, traduction FR/EN/DE, accessibilité, raccourcis clavier | Bon |
| **Monétisation** | Stripe intégré, page pricing, billing, subscription | Basique |

---

## B. CE QUI MANQUE POUR ETRE REVOLUTIONNAIRE

### URGENCE 1 -- Manques critiques

**1. Duels karaoké en temps réel** -- INEXISTANT
- Aucun composant duel/battle/versus dans le code
- C'est LE differenciateur viral absent : 2 étudiants s'affrontent sur un quiz musical live
- Nécessite : Supabase Realtime channels, matchmaking, scoring en direct, partage social du résultat

**2. Données pédagogiques incomplètes** -- BLOQUEUR
- 97% des items (357/367) n'ont toujours pas d'objectifs/compétences OIC structurés
- L'edge function `transform-edn-sections` existe mais n'est pas déployée/exécutée
- Sans contenu structuré, les parcours guidés et le tuteur IA manquent de matière

**3. Mode offline réel** -- FAUX SEMBLANT
- `OfflineModeManager.tsx` (388 lignes) est une UI statique avec des données mock
- Aucune implémentation réelle de Cache API ou IndexedDB pour le contenu
- Le service worker (vite-plugin-pwa) ne cache que les assets statiques, pas les chansons ni les quiz

**4. Tuteur IA contextuel par item** -- INCOMPLET
- Seul `ECNPredictionCard.tsx` existe dans `ai-tutor/` -- ce n'est pas un tuteur contextuel
- Le chat IA (MedChat) est générique, pas intégré dans la page d'un item spécifique
- Manque : contexte de l'item en cours, historique des erreurs de l'étudiant, plan de remédiation personnalisé

### URGENCE 2 -- Différenciateurs manquants

**5. Playlists SRS intelligentes automatiques**
- `PersonalizedPlaylistGenerator` existe mais c'est un formulaire manuel (choix mood/spécialité)
- Manque : génération AUTOMATIQUE d'une "playlist du jour" basée sur l'algorithme SM-2 (items à réviser aujourd'hui)
- Devrait se lancer au login : "Voici tes 8 chansons à réécouter aujourd'hui"

**6. Notifications push SRS (Duolingo-style)**
- `usePushNotifications` et `SRSNotificationSettings` existent mais sont des squelettes
- Pas de logique serveur (edge function) pour déclencher "Tu n'as pas révisé aujourd'hui !"
- Pas de scheduling côté backend

**7. Partage social viral**
- `SocialShare.tsx` existe mais basique
- Manque : image de score générée (Open Graph), partage story Instagram, "J'ai battu mon ami sur IC-100"
- Pas de système de parrainage

**8. Simulation examen blanc national**
- Mode examen existe mais pas de simulation complète : timer 3h, 120 questions, classement national simulé
- Pas de conditions réelles (pas de retour arrière, coefficient par rang)

### URGENCE 3 -- Polish & croissance

**9. Visualiseur audio**
- Aucune animation d'onde sonore pendant la lecture
- Rendrait le player beaucoup plus "premium" et immersif

**10. Fiches de synthèse PDF par item**
- jsPDF est installé mais pas de génération de fiche résumé structurée (1 page, points clés, mnémoniques)
- L'étudiant devrait pouvoir exporter une fiche après chaque écoute

**11. Images/schémas médicaux**
- Zéro contenu visuel médical (ECG, radio, schéma anatomique)
- Un item de cardiologie sans visuel est incomplet

**12. Validation médicale professionnelle**
- Le système `ContentValidationBadge` existe mais aucun contenu n'est réellement validé par un médecin
- Risque médico-légal sur du contenu IA non vérifié

---

## C. TOP 5 FEATURES REVOLUTIONNAIRES A IMPLEMENTER

```text
1. DUELS KARAOKE LIVE          → Viral, unique, aucun concurrent
2. PLAYLIST SRS AUTO DU JOUR   → "Spotify de la médecine" réalisé
3. TUTEUR IA CONTEXTUEL        → IA qui connaît ton item + tes erreurs
4. SIMULATION EXAMEN NATIONAL  → Conditions réelles EDN avec classement
5. PARTAGE SOCIAL GENERÉ       → Image de score + parrainage viral
```

## D. DETTE TECHNIQUE NOTABLE

- **700+ tables Supabase** -- fragmentation massive, consolidation nécessaire
- **11 niveaux de providers** dans App.tsx -- complexité excessive
- **90+ pages** -- beaucoup sont des dashboards admin rarement utilisés
- **Tests automatisés** -- quasi inexistants malgré Vitest configuré
- **Console.log en production** -- certains restent (objectif : 0 en production)

---

## E. SCORE PAR DIMENSION

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Audio/Player | 8/10 | Mini-player persistant OK, manque visualiseur |
| Contenu pédagogique | 3/10 | 97% sans objectifs structurés |
| IA & Personnalisation | 5/10 | RAG existe, tuteur contextuel absent |
| Social & Viral | 2/10 | UI existe, aucune feature temps réel |
| Parcours guidés | 7/10 | Nouveau, fonctionnel, à peupler |
| Gamification | 7/10 | Solide, manque duels |
| Offline/PWA | 2/10 | Squelette UI sans implémentation |
| Monétisation | 4/10 | Stripe basique, pas de freemium clair |
| Performance/Qualité | 6/10 | Lazy loading OK, dette technique lourde |
| **GLOBAL** | **4.9/10** | **Bon socle, exécution incomplète** |

La plateforme a toutes les briques posées mais la plupart sont des facades UI sans logique backend réelle. Le passage de 5/10 à 9/10 nécessite de transformer les squelettes en features fonctionnelles, en commençant par les duels live et la playlist SRS automatique.

