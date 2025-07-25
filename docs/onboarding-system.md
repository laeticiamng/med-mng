# Système d'Onboarding et d'Aide Contextuelle

## Vue d'ensemble

Le système d'onboarding et d'aide contextuelle offre une expérience utilisateur guidée et adaptative pour la plateforme médicale EDN.

## Architecture

### Composants principaux

1. **OnboardingModal** : Modal principal pour le parcours d'onboarding
2. **ContextualHelp** : Système de tooltips contextuels
3. **AdaptiveTooltip** : Aide adaptative basée sur le comportement utilisateur
4. **HelpButton** : Bouton d'aide flottant accessible depuis toute l'application

### Hook principal

- **useOnboarding** : Gestion centralisée de l'état et de la logique d'onboarding

## Base de données

### Table `onboarding_steps`

```sql
CREATE TABLE public.onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL DEFAULT '{}',
  body JSONB NOT NULL DEFAULT '{}',
  type TEXT NOT NULL DEFAULT 'onboarding',
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Types supportés

- **onboarding** : Étapes du parcours principal
- **tooltip** : Aide contextuelle
- **help** : Documentation d'aide

## Fonctionnalités

### 1. Onboarding adaptatif

- Détection automatique des nouveaux utilisateurs
- Progression sauvegardée en localStorage
- Skip et navigation libre
- Contenu multilingue (FR/EN)

### 2. Aide contextuelle

- Tooltips intelligents basés sur la route actuelle
- Adaptation au niveau de l'utilisateur (débutant/intermédiaire/avancé)
- Dismissal persistant des conseils déjà vus

### 3. Aide adaptative

- Analyse du comportement utilisateur
- Suggestions personnalisées
- Aide proactive pour les nouvelles fonctionnalités

## Usage

### Intégration dans un composant

```tsx
import { ContextualHelp } from '@/components/onboarding/ContextualHelp';

// Aide simple
<ContextualHelp content="Aide rapide" title="Conseil">
  <Button>Action importante</Button>
</ContextualHelp>

// Aide adaptative
<AdaptiveTooltip
  feature="music-generation"
  title="Génération musicale"
  trigger="first-visit"
>
  <GenerateButton />
</AdaptiveTooltip>
```

### Démarrage manuel de l'onboarding

```tsx
import { useOnboarding } from '@/hooks/useOnboarding';

const { startOnboarding } = useOnboarding();

// Redémarrer le tutoriel
<Button onClick={startOnboarding}>
  Refaire le tutoriel
</Button>
```

## Configuration

### Variables localStorage

- `onboarding_completed` : Array des étapes terminées
- `onboarding_active` : État actif/inactif de l'onboarding
- `visited_${feature}` : Tracking des visites par fonctionnalité
- `feature_usage_${feature}` : Compteur d'utilisation par fonctionnalité
- `help_dismissed_${key}` : Aide contextuelles masquées

### Logique adaptative

1. **Niveau utilisateur** (basé sur `completed_actions`)
   - Débutant : < 5 actions
   - Intermédiaire : 5-20 actions
   - Avancé : > 20 actions

2. **Déclencheurs d'aide**
   - `first-visit` : Première visite d'une fonctionnalité
   - `hover` : Au survol
   - `manual` : Déclenchement explicite

## Contenu par défaut

Le système inclut des étapes d'onboarding pré-configurées :

1. **Bienvenue** : Introduction à la plateforme
2. **Génération musicale IA** : Guide de création
3. **Bibliothèque médicale** : Organisation des contenus
4. **Navigation EDN** : Exploration par spécialité

Plus des tooltips contextuels pour :

- Sélection de style musical
- Filtres de bibliothèque
- Compréhension des rangs EDN

## Personnalisation

### Ajout de nouvelles étapes

```sql
INSERT INTO public.onboarding_steps (key, title, body, type) VALUES
('nouvelle-fonctionnalite',
 '{"fr": "Nouvelle fonctionnalité", "en": "New Feature"}',
 '{"fr": "Description détaillée...", "en": "Detailed description..."}',
 'onboarding');
```

### Modification du comportement adaptatif

Personnalisez la logique dans `AdaptiveTooltip.tsx` :

```tsx
const checkIfShouldShow = () => {
  const userLevel = getUserLevel();
  const featureUsage = getFeatureUsage(feature);
  
  // Logique personnalisée
  if (condition_specifique) {
    setShouldShow(true);
  }
};
```

## Intégration API

Le système utilise l'endpoint `/help/onboarding` existant pour récupérer le contenu depuis la base de données, avec support automatique de la langue et fallback vers l'anglais.

## Accessibilité

- Support complet du clavier
- ARIA labels appropriés
- Contraste respectant WCAG 2.1
- Navigation au clavier dans les modals

Ce système offre une expérience d'onboarding complète et adaptative, guidant efficacement les utilisateurs tout en respectant les bonnes pratiques UX et d'accessibilité.