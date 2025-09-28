# 📖 MED-MNG - User Stories & Wireframes

## 🎯 Personas Utilisateurs

### 👨‍🎓 Étudiant en Médecine
**Profil** : 3ème année médecine, prépare EDN, utilise mobile + desktop
**Besoins** : Révisions efficaces, mémorisation, QCM, contenus engageants

### 👩‍⚕️ Interne
**Profil** : Post-EDN, spécialisation, peu de temps libre
**Besoins** : Révisions rapides, approfondissement spécialisé, mobile-first

### 👨‍🏫 Enseignant
**Profil** : Faculté de médecine, crée contenus pédagogiques
**Besoins** : Dashboard admin, monitoring étudiants, analytics

---

## 🎵 Epic 1 : Génération & Écoute Musicale

### US-1.1 : Génération Musicale sur Item EDN
```
En tant qu'étudiant en médecine,
Je veux générer une chanson pour un item EDN spécifique (rang A, B ou mixte),
Afin de mémoriser les connaissances de façon ludique et efficace.

Critères d'acceptation :
✅ Sélection item EDN dans la liste (IC-1 à IC-367)
✅ Choix du rang (A, B, A+B mixte)
✅ Choix du style musical (pop, rap, rock, classique)
✅ Génération via Suno AI en arrière-plan
✅ Feedback temps réel (loader, estimation durée)
✅ Notification toast quand la chanson est prête
✅ Ajout automatique à "Mes Générations"
✅ Streaming immédiat possible
✅ Respect des quotas abonnement

Wireframe :
┌─────────────────────────────────────────┐
│  🎵 Générer une Chanson                │
├─────────────────────────────────────────┤
│  Item EDN : [IC-23 Grossesse normale ▼]│
│  Rang : [○ A] [●B] [○ A+B mixte]       │
│  Style : [Pop ▼]                       │
│                                         │
│  [🎵 Générer ma chanson]               │
│                                         │
│  💡 Quota restant : 8/10 générations   │
└─────────────────────────────────────────┘
```

### US-1.2 : Écoute Streaming Sécurisée
```
En tant qu'utilisateur,
Je veux écouter mes chansons en streaming uniquement,
Afin de respecter les droits d'auteur et la sécurité de la plateforme.

Critères d'acceptation :
✅ Lecture streaming-only (pas de download)
✅ Player avec controls standards (play/pause/progress)
✅ Lyrics synchronisées affichées en temps réel
✅ Gestion des erreurs de streaming
✅ Qualité audio adaptative selon connexion
✅ Aucun bouton/option de téléchargement visible
✅ Protection contre download via devtools
✅ Session timeout sécurisée

Wireframe :
┌─────────────────────────────────────────┐
│  🎵 En Écoute                          │
├─────────────────────────────────────────┤
│  ♪ IC-23 Rang B - Complications        │
│  [◀◀] [⏸️] [▶▶]    2:34 / 4:12        │
│  ████████████░░░░░░░                    │
│                                         │
│  📝 Lyrics synchronisées :              │
│  > Les complications de la grossesse... │
│    sont multiples et variées...        │
│                                         │
│  [❤️ Favori] [➕ Playlist] [🔄 Répéter] │
└─────────────────────────────────────────┘
```

---

## 📚 Epic 2 : Contenus Pédagogiques (BD, Roman, Poème)

### US-2.1 : Consultation BD Générée
```
En tant qu'étudiant,
Je veux consulter la BD officielle d'un item EDN,
Afin de visualiser les concepts médicaux de façon illustrée.

Critères d'acceptation :
✅ Accès à la BD depuis la fiche item
✅ BD générée une seule fois (version officielle)
✅ Interface galerie avec navigation fluide
✅ Zoom sur les planches
✅ Légendes explicatives sur chaque case
✅ Badges "Contenu officiel MED-MNG"
✅ Aucune option de régénération pour l'utilisateur
✅ Partage possible avec autres étudiants

Wireframe :
┌─────────────────────────────────────────┐
│  📖 BD IC-23 - Grossesse normale       │
│  🏆 Contenu officiel MED-MNG           │
├─────────────────────────────────────────┤
│  [< Prev]  Planche 3/8  [Next >]      │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │                                     │ │
│  │        [Image BD Case 1]            │ │
│  │     "L'ovulation se produit..."     │ │
│  │                                     │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  [🔍 Zoom] [💬 Partager] [📚 Retour]   │
└─────────────────────────────────────────┘
```

### US-2.2 : Lecture Roman/Poème
```
En tant qu'étudiant,
Je veux lire le roman/poème officiel d'un item EDN,
Afin d'approfondir ma compréhension par la narration.

Critères d'acceptation :
✅ Interface de lecture optimisée (scroll fluide)
✅ Chapitres/strophes numérotés
✅ Mode nuit/jour
✅ Taille police ajustable
✅ Marque-pages automatiques
✅ Recherche dans le texte
✅ Annotations personnelles possibles
✅ Version officielle non modifiable

Wireframe :
┌─────────────────────────────────────────┐
│  📚 Roman IC-45 - Endométriose         │
├─────────────────────────────────────────┤
│  [🌙] [Aa+] [🔍] [📑]     Chapitre 2/5 │
│                                         │
│  Marie ressent une douleur intense     │
│  dans le bas-ventre. Cette douleur     │
│  cyclique, qui revient chaque mois     │
│  pendant ses règles, l'inquiète de     │
│  plus en plus...                       │
│                                         │
│  [Note perso: "Dysménorrhée"]          │
│                                         │
│  La consultation chez le gynécologue   │
│  révèle la présence d'endométriose...  │
│                                         │
│  [< Chapitre 1] [Chapitre 3 >]        │
└─────────────────────────────────────────┘
```

---

## 🧠 Epic 3 : QCM & Corrections Intelligentes

### US-3.1 : QCM Personnalisés par Item
```
En tant qu'étudiant,
Je veux passer un QCM personnalisé sur un item EDN,
Afin d'évaluer mes connaissances de façon ciblée.

Critères d'acceptation :
✅ Génération QCM selon item + rang + difficulté
✅ Questions variées (QCU, QCM, cas cliniques)
✅ Interface intuitive avec feedback immédiat
✅ Timer paramétrable
✅ Sauvegarde progression
✅ Explications détaillées pour chaque réponse
✅ Score final avec recommandations
✅ Historique des sessions QCM

Wireframe :
┌─────────────────────────────────────────┐
│  📝 QCM IC-23 Rang A                   │
│  Question 3/10          ⏱️ 15:23      │
├─────────────────────────────────────────┤
│  Quelles sont les complications        │
│  possibles de la grossesse normale ?   │
│                                         │
│  ☐ A) Diabète gestationnel             │
│  ☐ B) Hypertension artérielle          │
│  ☐ C) Hémorragie de la délivrance      │
│  ☐ D) Infection urinaire               │
│  ☐ E) Toutes les réponses              │
│                                         │
│  [Valider ma réponse]                  │
│                                         │
│  💡 Conseil : Pensez aux complications │
│      les plus fréquentes...            │
└─────────────────────────────────────────┘
```

### US-3.2 : Chanson des Erreurs
```
En tant qu'étudiant qui vient de finir un QCM,
Je veux générer une chanson basée sur mes erreurs,
Afin de mémoriser mes lacunes de façon musicale.

Critères d'acceptation :
✅ Bouton "Générer chanson de mes erreurs" après QCM
✅ Génération automatique via Suno AI
✅ Paroles focalisées sur les notions ratées
✅ Style musical au choix
✅ Ajout automatique à une playlist "Mes Erreurs"
✅ Possibilité de refaire le QCM après écoute
✅ Suivi des progrès entre sessions

Wireframe :
┌─────────────────────────────────────────┐
│  📊 Résultats QCM IC-23                │
├─────────────────────────────────────────┤
│  Score : 7/10 (70%)                    │
│  🟢🟢🟢🟢🟢🟢🟢🔴🔴🔴                   │
│                                         │
│  ❌ Erreurs détectées :                 │
│  • Question 8 : Diabète gestationnel   │
│  • Question 9 : HTA gravidique          │
│  • Question 10 : Hémorragies           │
│                                         │
│  🎵 Transformez vos erreurs en chanson !│
│  [🎵 Générer chanson d'erreurs]        │
│                                         │
│  [📚 Revoir le cours] [🔄 Refaire QCM] │
└─────────────────────────────────────────┘
```

---

## 💬 Epic 4 : Chat IA Contextuel

### US-4.1 : Chat Médical Intelligent
```
En tant qu'étudiant,
Je veux poser des questions médicales à l'IA,
Afin d'obtenir des réponses précises basées sur le référentiel EDN.

Critères d'acceptation :
✅ Interface chat accessible depuis partout
✅ Réponses prioritairement basées sur EDN
✅ Fallback web si notion non trouvée
✅ Sources clairement indiquées (EDN/Web)
✅ Suggestions automatiques de contenus liés
✅ Historique des conversations
✅ Bookmarks des réponses importantes
✅ Mode urgence pour questions critiques

Wireframe :
┌─────────────────────────────────────────┐
│  💬 Chat IA Médical                    │
├─────────────────────────────────────────┤
│  Vous: "Qu'est-ce que l'endométriose?" │
│                                         │
│  🤖 IA: L'endométriose est définie     │
│  comme la présence de tissu           │
│  endométrial en dehors de l'utérus...  │
│  📚 Source: EDN Item IC-45             │
│                                         │
│  💡 Suggestions liées :                │
│  🎵 Chanson IC-45 Endométriose         │
│  📝 QCM Gynécologie                    │
│  📖 BD Cycle menstruel                 │
│                                         │
│  [Tapez votre question...]             │
└─────────────────────────────────────────┘
```

### US-4.2 : Suggestions Intelligentes
```
En tant qu'utilisateur du chat IA,
Je veux recevoir des suggestions de contenus pertinents,
Afin d'approfondir ma compréhension du sujet abordé.

Critères d'acceptation :
✅ Suggestions automatiques après chaque réponse
✅ Liens vers musiques/QCM/BD relatifs
✅ Recommandations basées sur historique
✅ Niveau adapté au profil utilisateur
✅ Intégration native avec autres fonctionnalités
✅ Feedback pour améliorer suggestions
✅ Mode exploration pour découvrir nouveaux sujets
```

---

## 📂 Epic 5 : Playlists & Bibliothèque

### US-5.1 : Gestion de Bibliothèque Musicale
```
En tant qu'étudiant,
Je veux organiser mes chansons médicales dans une bibliothèque,
Afin de retrouver facilement mes contenus favoris.

Critères d'acceptation :
✅ Vue liste/grille des chansons
✅ Filtres par spécialité/item/rang/date
✅ Recherche textuelle avancée
✅ Tri par titre/date/popularité
✅ Favoris avec raccourci rapide
✅ Historique d'écoute complet
✅ Export playlists (format propriétaire)
✅ Statistiques personnelles d'écoute

Wireframe :
┌─────────────────────────────────────────┐
│  🎵 Ma Bibliothèque (127 chansons)     │
├─────────────────────────────────────────┤
│  [🔍] [📊 Tri ▼] [⚡ Filtres ▼]       │
│                                         │
│  🎵 IC-23 Rang A - Grossesse normale   │
│  👤 Généré le 15/01  ❤️ 👁️ 23 écoutes │
│  [▶️] [❤️] [➕ Playlist]               │
│                                         │
│  🎵 IC-45 Rang B - Endométriose        │
│  👤 Généré le 14/01  ❤️ 👁️ 12 écoutes │
│  [▶️] [❤️] [➕ Playlist]               │
│                                         │
│  [Charger plus...]                     │
└─────────────────────────────────────────┘
```

### US-5.2 : Création et Gestion de Playlists
```
En tant qu'étudiant,
Je veux créer des playlists thématiques,
Afin d'organiser mes révisions par spécialité ou période.

Critères d'acceptation :
✅ Création playlist avec nom/description
✅ Drag & drop pour réorganiser
✅ Playlists intelligentes (auto-peuplées)
✅ Partage avec autres étudiants (optionnel)
✅ Mode lecture aléatoire/séquentielle
✅ Synchronisation inter-appareils
✅ Sauvegarde automatique
✅ Playlists publiques/privées

Wireframe :
┌─────────────────────────────────────────┐
│  📁 Mes Playlists                      │
├─────────────────────────────────────────┤
│  ➕ Créer nouvelle playlist             │
│                                         │
│  📂 Gynéco-Obstétrique (12 chansons)   │
│  🎵 Dernière écoute: IC-23             │
│  [▶️ Lecture] [✏️ Modifier] [🗑️]       │
│                                         │
│  📂 Cardiologie (8 chansons)           │
│  🎵 Dernière écoute: IC-229            │
│  [▶️ Lecture] [✏️ Modifier] [🗑️]       │
│                                         │
│  📂 Favoris du mois (25 chansons)      │
│  🤖 Playlist intelligente              │
│  [▶️ Lecture] [⚙️ Config]              │
└─────────────────────────────────────────┘
```

---

## 📊 Epic 6 : Quotas & Abonnements

### US-6.1 : Visualisation Quotas
```
En tant qu'utilisateur,
Je veux voir clairement mes quotas d'utilisation,
Afin de gérer ma consommation IA de façon éclairée.

Critères d'acceptation :
✅ Dashboard quotas visible en permanence
✅ Barre de progression par type (musique/QCM/chat)
✅ Notification avant épuisement quota
✅ Historique de consommation mensuelle
✅ Date de reset clairement indiquée
✅ Comparaison avec mois précédents
✅ Recommandations d'optimisation
✅ Call-to-action upgrade si nécessaire

Wireframe :
┌─────────────────────────────────────────┐
│  📊 Mes Quotas - Abonnement Standard   │
├─────────────────────────────────────────┤
│  🎵 Générations musicales              │
│  ████████░░ 8/10 utilisées             │
│  Reset dans 12 jours                   │
│                                         │
│  📝 QCM IA                             │
│  ██████████ 47/50 utilisés             │
│  ⚠️  Plus que 3 QCM disponibles        │
│                                         │
│  💬 Chat IA                            │
│  ██████░░░░ 234/500 messages           │
│                                         │
│  [📈 Historique] [⬆️ Upgrader]         │
└─────────────────────────────────────────┘
```

### US-6.2 : Gestion d'Abonnement
```
En tant qu'utilisateur,
Je veux gérer mon abonnement facilement,
Afin d'adapter mes quotas à mes besoins.

Critères d'acceptation :
✅ Vue claire du plan actuel
✅ Comparaison plans disponibles
✅ Upgrade/downgrade en un clic
✅ Facturation transparente
✅ Historique des paiements
✅ Annulation possible
✅ Support client intégré
✅ Essai gratuit pour nouveaux plans
```

---

## 🔐 Epic 7 : Sécurité & Monitoring

### US-7.1 : Tableau de Bord Admin
```
En tant qu'administrateur,
Je veux monitorer l'usage de la plateforme en temps réel,
Afin de garantir performance et sécurité.

Critères d'acceptation :
✅ Dashboard temps réel des métriques clés
✅ Alertes automatiques sur anomalies
✅ Logs d'accès et d'erreurs centralisés
✅ Monitoring générations musicales
✅ Audit sécurité streaming
✅ Statistiques utilisateurs
✅ Export rapports pour management
✅ Gestion incidents

Wireframe :
┌─────────────────────────────────────────┐
│  🛡️ Dashboard Admin MED-MNG            │
├─────────────────────────────────────────┤
│  🟢 Système opérationnel               │
│  📊 1,247 utilisateurs actifs          │
│  🎵 89 générations en cours            │
│  ⚡ Temps moyen génération: 23s         │
│                                         │
│  🚨 Alertes (2)                        │
│  ⚠️  Génération lente item IC-45       │
│  ⚠️  3 items incomplets détectés       │
│                                         │
│  📈 Métriques 24h                      │
│  • 456 chansons générées               │
│  • 1,234 QCM complétés                 │
│  • 5,678 messages chat IA              │
│                                         │
│  [📊 Analytics] [🔧 Maintenance]       │
└─────────────────────────────────────────┘
```

---

## 📱 Epic 8 : Mobile & Responsive

### US-8.1 : Expérience Mobile Optimisée
```
En tant qu'étudiant mobile,
Je veux accéder à toutes les fonctionnalités sur smartphone,
Afin de réviser n'importe où.

Critères d'acceptation :
✅ Design responsive parfait
✅ Navigation tactile intuitive
✅ Player audio optimisé mobile
✅ Offline mode pour contenus téléchargés
✅ Notifications push
✅ Mode nuit automatique
✅ Gestes swipe pour navigation
✅ Performance optimisée (< 3s loading)

Wireframe Mobile :
┌─────────────────┐
│  🎵 MED-MNG     │
├─────────────────┤
│  [🔍] [👤] [⚙️] │
│                 │
│  🎵 En cours    │
│  IC-23 Rang A   │
│  [⏸️] 2:34/4:12 │
│  ████████░░░░░░  │
│                 │
│  📚 Mes Items   │
│  🎵 IC-45 ▶️    │
│  📝 QCM ▶️      │
│  💬 Chat ▶️     │
│                 │
│  📊 Quota 8/10  │
└─────────────────┘
```

---

## 🎓 Epic 9 : Onboarding & Tutoriels

### US-9.1 : Première Découverte
```
En tant que nouvel utilisateur,
Je veux comprendre rapidement comment utiliser MED-MNG,
Afin de tirer parti de toutes les fonctionnalités.

Critères d'acceptation :
✅ Tour guidé interactif
✅ Exemples concrets avec vrais items EDN
✅ Démonstration génération musicale
✅ Explication système de quotas
✅ Points d'aide contextuels
✅ Vidéos tutoriels intégrées
✅ Support chat en direct
✅ Possibilité de skip/reprendre

Wireframe Onboarding :
┌─────────────────────────────────────────┐
│  🎉 Bienvenue sur MED-MNG !            │
├─────────────────────────────────────────┤
│  Étape 1/5 : Génération Musicale       │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │  🎵 Transformez vos cours en       │ │
│  │     chansons mémorisables !        │ │
│  │                                    │ │
│  │  [Essayer avec IC-1 →]            │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  💡 Chaque item EDN peut devenir       │
│     une chanson unique !               │
│                                         │
│  [⏭️ Passer] [📹 Voir démo] [Suivant →]│
└─────────────────────────────────────────┘
```

---

## 🏆 Epic 10 : Gamification & Engagement

### US-10.1 : Système de Badges et Progression
```
En tant qu'étudiant,
Je veux être récompensé pour mon assiduité,
Afin de rester motivé dans mes révisions.

Critères d'acceptation :
✅ Badges débloqués selon actions
✅ Système de points/niveaux
✅ Défis hebdomadaires
✅ Classements entre amis
✅ Streaks de connexion
✅ Récompenses spéciales
✅ Partage achievements sur réseaux
✅ Notifications de progression

Wireframe :
┌─────────────────────────────────────────┐
│  🏆 Mes Achievements                   │
├─────────────────────────────────────────┤
│  Niveau 12 - Étudiant Mélomane         │
│  ████████████░░░░░░░ 2,847 XP          │
│                                         │
│  🏅 Badges récents :                   │
│  🎵 Générateur Pro (50 chansons)       │
│  📚 Marathonien QCM (100 sessions)     │
│  🔥 Streak 30 jours                    │
│                                         │
│  🎯 Défis en cours :                   │
│  🎵 Générer 5 chansons cardio (3/5)    │
│  📝 Réussir 10 QCM > 80% (7/10)       │
│                                         │
│  👥 Classement amis :                  │
│  1. Marie (3,456 XP) 🥇               │
│  2. Toi (2,847 XP) 🥈                 │
│  3. Paul (2,134 XP) 🥉               │
└─────────────────────────────────────────┘
```

---

## 📋 Checklist Qualité UX

### ✅ Performance & Accessibilité
- [ ] Temps de chargement < 3s
- [ ] Support lecteurs d'écran
- [ ] Navigation clavier complète
- [ ] Contraste WCAG 2.1 AA
- [ ] Mode sombre/clair
- [ ] Texte redimensionnable
- [ ] Alt text sur toutes images
- [ ] Focus visuel clair

### ✅ Compatibilité
- [ ] Chrome, Firefox, Safari, Edge
- [ ] iOS 14+, Android 8+
- [ ] Responsive 320px à 2560px
- [ ] Offline mode basique
- [ ] Progressive Web App
- [ ] Performance 3G/4G

### ✅ Sécurité UX
- [ ] Aucun téléchargement visible
- [ ] Messages d'erreur clairs
- [ ] Protection données personnelles
- [ ] Logout automatique sécurisé
- [ ] Validation input utilisateur
- [ ] HTTPS obligatoire

---

**Ces user stories constituent la base fonctionnelle complète de MED-MNG, garantissant une expérience utilisateur exceptionnelle tout en respectant les contraintes techniques et business.**