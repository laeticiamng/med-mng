

# Audit Complet MED-MNG -- Ce qui manque pour être unique et révolutionnaire

## Score actuel : Bonne base (7/10) -- Potentiel révolutionnaire non exploité

---

## A. CE QUI EXISTE ET FONCTIONNE

La plateforme a déjà un socle solide :
- 367 items EDN avec paroles musicales, scènes immersives, quiz
- Génération musicale IA (Suno V4/V5)
- Chat IA médical (GPT-4)
- Système SRS (répétition espacée SM-2)
- Flashcards, mode examen, cas cliniques
- Gamification (XP, streaks, badges, leaderboard)
- Karaoke player avec fill-the-blank médical
- Onboarding anti-anxiété
- Traduction FR/EN/DE
- PWA basique, design Apple-style

---

## B. CE QUI MANQUE POUR ÊTRE RÉVOLUTIONNAIRE

### 1. Expérience Audio/Musicale (Le coeur du produit -- incomplet)

| Manque | Impact | Priorité |
|--------|--------|----------|
| **Lecteur audio persistant (mini-player global)** | L'utilisateur perd la musique en changeant de page. Spotify ne coupe jamais la musique. | CRITIQUE |
| **Playlists intelligentes automatiques** | "Ma playlist du jour" basée sur SRS + items faibles. Pas juste une liste statique. | CRITIQUE |
| **Mode écoute passive** | Pouvoir écouter les chansons en boucle pendant le transport, le sport, sans interaction UI. | HAUT |
| **Vitesse de lecture ajustable** (0.5x-2x) sur le player | Pour ralentir et comprendre les paroles complexes. | MOYEN |
| **Visualiseur audio** | Onde sonore animée pendant la lecture, comme Spotify/Apple Music. Fait "pro". | MOYEN |

### 2. Intelligence Artificielle (Sous-exploitée)

| Manque | Impact | Priorité |
|--------|--------|----------|
| **Tuteur IA contextuel dans chaque item** | Le chat IA existe mais il est déconnecté du contenu. Il devrait connaître l'item en cours. | CRITIQUE |
| **Génération de paroles personnalisées** | L'IA devrait adapter les paroles au niveau de l'étudiant (débutant vs avancé). | HAUT |
| **Analyse des erreurs par IA** | Après un quiz raté, l'IA devrait expliquer POURQUOI et proposer un plan de remédiation. | HAUT |
| **RAG sur le référentiel médical** | Le chat IA invente parfois. Il devrait s'appuyer sur les vrais documents (collèges, HAS). | HAUT |
| **Voice-to-quiz** | L'étudiant chante/récite les paroles, l'IA évalue sa mémorisation via reconnaissance vocale. | MOYEN |

### 3. Social & Communautaire (Quasi inexistant en production)

| Manque | Impact | Priorité |
|--------|--------|----------|
| **Groupes d'étude** | Créer un groupe, partager des playlists, se challenger entre amis. | CRITIQUE |
| **Duels musicaux** | 2 étudiants s'affrontent en temps réel sur un quiz karaoké. Viral et addictif. | HAUT |
| **Partage de scores sur les réseaux** | "J'ai scoré 95% sur IC-100 en musique!" avec image générée. | MOYEN |
| **Mentorat P2→D4** | Les étudiants avancés aident les débutants. Crée de la rétention. | MOYEN |

### 4. Parcours Pédagogique (Trop libre, pas assez guidé)

| Manque | Impact | Priorité |
|--------|--------|----------|
| **Parcours guidé par spécialité** | "Parcours Cardiologie" : 15 items dans l'ordre optimal, avec checkpoints. | CRITIQUE |
| **Objectifs de semaine avec deadline** | "Cette semaine : maîtrise 5 items". Notifications push si retard. | HAUT |
| **Certification de maîtrise par item** | Badge "Item IC-1 Maîtrisé" après 3 quiz réussis + SRS stable. Visible sur profil. | HAUT |
| **Simulation d'examen blanc national** | Conditions réelles EDN : 3h, 120 questions, classement national simulé. | HAUT |
| **Tableau de bord "Jours avant l'examen"** | Compte à rebours + items restants + rythme nécessaire. Crée l'urgence. | MOYEN |

### 5. Contenu & Qualité (Le talon d'Achille)

| Manque | Impact | Priorité |
|--------|--------|----------|
| **97% des items n'ont pas de contenu pédagogique structuré** | Objectifs/compétences OIC manquants pour 357/367 items. C'est le problème #1. | CRITIQUE |
| **Validation médicale par des professionnels** | Aucun contenu n'est validé par un médecin. Risque médico-légal. | CRITIQUE |
| **Fiches de synthèse par item** | Résumé visuel 1 page après écoute. PDF exportable. | HAUT |
| **Images/schémas médicaux** | Zéro illustration médicale. Un item de cardiologie sans ECG, c'est incomplet. | HAUT |
| **Vidéos courtes (reels)** | Format TikTok/Reels de 30s par item. Viral et mémorisable. | MOYEN |

### 6. Mobile & Offline (PWA insuffisant)

| Manque | Impact | Priorité |
|--------|--------|----------|
| **Mode offline réel** | Télécharger des chansons + quiz pour le métro/avion. Actuellement non fonctionnel. | CRITIQUE |
| **Notifications push** | "Tu n'as pas révisé aujourd'hui", "3 items en retard SRS". Duolingo-style. | HAUT |
| **Widget mobile** | "Item du jour" sur l'écran d'accueil du téléphone. | MOYEN |

### 7. Monétisation & Growth (Pas de moteur viral)

| Manque | Impact | Priorité |
|--------|--------|----------|
| **Parrainage avec récompenses** | "Invite 3 amis → 1 mois premium gratuit". Moteur de croissance organique. | HAUT |
| **Freemium intelligent** | Actuellement flou. Définir : 5 items gratuits, le reste payant. | HAUT |
| **Essai gratuit de 7 jours** avec onboarding email | Séquence d'emails automatiques pendant l'essai. | MOYEN |

---

## C. LES 5 FEATURES QUI RENDRAIENT MED-MNG VRAIMENT RÉVOLUTIONNAIRE

### 1. "Live Karaoke Battle" (Aucun concurrent ne l'a)
Deux étudiants s'affrontent en temps réel : la chanson joue, les paroles défilent avec des trous, le premier qui complète gagne des XP. Partageable en story Instagram.

### 2. "AI Study Coach" contextuel (Différenciateur #1)
Un tuteur IA qui connaît TOUT le contexte : tes scores, tes items faibles, ton rythme, et qui dit "Aujourd'hui, écoute IC-45 puis fais le quiz IC-12 que tu as raté hier". Pas un chatbot générique.

### 3. "Spotify Mode" -- Lecteur persistant global
La musique ne s'arrête JAMAIS quand tu navigues. Mini-player en bas, paroles synchronisées, mode "playlist intelligente SRS" qui joue automatiquement les items à réviser.

### 4. "Medical Reels" -- Vidéos de 30 secondes
Chaque item a un reel de 30s avec la chanson + visuels animés + 3 points clés. Format natif Gen-Z, partageable, viral.

### 5. "Certification MNG" -- Preuve de maîtrise
Après avoir maîtrisé un parcours complet (quiz + SRS + examen blanc), l'étudiant reçoit un certificat numérique vérifiable. Les facs pourraient le reconnaître.

---

## D. RÉSUMÉ DES PRIORITÉS

```text
URGENCE 1 (Fait ou meurt) :
├── Lecteur audio persistant global (mini-player)
├── Compléter les données pédagogiques (357 items vides)
├── Parcours guidés par spécialité
└── Mode offline fonctionnel

URGENCE 2 (Différenciateurs) :
├── Tuteur IA contextuel par item
├── Duels karaoké en temps réel
├── Playlists SRS intelligentes automatiques
└── Notifications push (rappels SRS)

URGENCE 3 (Polish & Growth) :
├── Partage social & parrainage
├── Fiches de synthèse PDF par item
├── Simulation examen blanc national
└── Visualiseur audio premium
```

La plateforme a une proposition de valeur unique ("apprendre la médecine en musique") mais elle n'exploite pas encore pleinement cette promesse. Le lecteur audio persistant et les parcours guidés sont les deux manques les plus critiques pour transformer l'essai.

