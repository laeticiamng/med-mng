# ⚠️ LIMITATIONS ET TRANSPARENCE - MED-MNG

**Dernière mise à jour** : Février 2025

Ce document présente honnêtement les limitations actuelles de la plateforme MED-MNG.

---

## 📊 Métriques Réalistes

### Ce qui existe réellement
| Métrique | Valeur réelle | Contexte |
|----------|---------------|----------|
| Pages React | ~80 | Estimation basée sur l'arborescence |
| Hooks personnalisés | ~100 | Logique métier React |
| Tables Supabase | ~50-80 | Tables actives (non 723) |
| Edge Functions | ~15-20 | Fonctions déployées |
| Couverture tests | Non mesurée | Aucun outil de couverture configuré |

### Clarification des scores internes
Les scores "20/20" ou "Grade A+" mentionnés dans certains documents sont des **auto-évaluations internes** et non des audits externes certifiés. Ils reflètent des objectifs de qualité, pas des certifications.

**Aucun audit externe n'a été réalisé** concernant :
- La sécurité (pentesting)
- La conformité RGPD/HDS
- La qualité du code
- L'accessibilité WCAG

---

## ⚕️ Avertissement Médical Important

### Ce que MED-MNG N'EST PAS
- ❌ Un dispositif médical certifié (marquage CE)
- ❌ Une source de diagnostic ou traitement
- ❌ Un substitut à l'enseignement médical officiel
- ❌ Un outil validé par des autorités de santé

### Ce que MED-MNG EST
- ✅ Un outil pédagogique expérimental
- ✅ Une aide à la mémorisation (non un contenu médical validé)
- ✅ Un projet en développement actif

### Risques identifiés
1. **Contenu IA non supervisé** : Les cas cliniques et réponses générées par IA peuvent contenir des erreurs médicales graves
2. **Absence de revue par les pairs** : Aucun comité médical ne valide les contenus
3. **Responsabilité** : Les utilisateurs restent responsables de vérifier toute information auprès de sources officielles (Collèges, HAS, etc.)

---

## 💰 Dépendances et Coûts

### APIs propriétaires utilisées
| Service | Usage | Risque |
|---------|-------|--------|
| OpenAI | Chat médical, génération | Coût par token, dépendance |
| Perplexity | Recherche web | Coût par requête |
| Firecrawl | Scraping guidelines | Limites de requêtes |
| ElevenLabs | Synthèse vocale | Coût par caractère |
| Suno | Génération musicale | Abonnement requis |
| Stripe | Paiements | Frais de transaction |

### Mode hors-ligne
- ⚠️ **Non disponible actuellement**
- Les fonctionnalités IA nécessitent une connexion internet
- Les contenus pré-générés (SRS, flashcards) pourraient fonctionner offline (non testé)

### Alternatives open-source envisagées (non implémentées)
- LLaMA / Mistral pour le LLM
- Whisper local pour la transcription
- Générateurs musicaux open-source

---

## 🏗️ Complexité et Dette Technique

### Risques identifiés
1. **Nombre de modules** : Trop de fonctionnalités pour une équipe réduite
2. **Intégrations multiples** : Chaque API est un point de défaillance potentiel
3. **Maintenabilité** : La documentation interne peut devenir obsolète rapidement

### Modules actifs vs planifiés

#### ✅ Fonctionnel (testé manuellement)
- Navigation et routage
- Authentification Supabase
- Interface utilisateur de base
- Préférences d'accessibilité

#### ⚠️ Partiellement fonctionnel
- Chat IA médical (dépend des clés API)
- Génération musicale (dépend de Suno)
- Système SRS (logique présente, données limitées)

#### 📋 Planifié / Non implémenté
- Community Hub (forum, mentorat)
- Mode hors-ligne complet
- Export PDF avancé
- RAG sur documentation médicale

---

## 📜 Conformité Réglementaire

### Statut actuel
| Exigence | Statut |
|----------|--------|
| RGPD | Partiellement conforme (mentions légales à compléter) |
| HDS (Hébergement Données Santé) | ❌ Non certifié |
| Marquage CE (dispositif médical) | ❌ Non applicable actuellement |
| WCAG 2.1 AA | En cours d'implémentation |

### Actions requises avant production réelle
1. Audit RGPD complet
2. Évaluation du statut "dispositif médical logiciel"
3. Politique de confidentialité complète
4. Procédure de suppression des données

---

## 👥 Fonctionnalités Communautaires

### Clarification
Le "Community Hub" mentionné dans certains documents est **planifié mais non implémenté**.

- ❌ Forum de discussion : non disponible
- ❌ Système de mentorat : non disponible
- ❌ Partage de ressources : non disponible

Ces fonctionnalités nécessiteraient :
- Modération active
- Charte de bienveillance
- Outils de signalement
- Conformité aux règles de confidentialité médicale

---

## 🎯 Périmètre Recommandé (MVP)

### Fonctionnalités cœur à prioriser
1. **Apprentissage Items EDN** avec approche musicale
2. **Système SRS** fiable et testé
3. **Interface accessible** et agréable

### Fonctionnalités secondaires (phase 2+)
- Assistant IA clinique
- Cas cliniques générés
- Intégrations productivité
- Gamification avancée

---

## 📝 Engagement de Transparence

Ce document sera mis à jour régulièrement pour refléter l'état réel du projet. Les utilisateurs sont encouragés à signaler toute incohérence entre la documentation et les fonctionnalités réelles.

**Contact** : Ouvrir une issue sur le dépôt GitHub

---

*Document créé suite à une analyse critique constructive - Février 2025*
