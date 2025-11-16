import type { Meta, StoryObj } from '@storybook/react';
import { RobustErrorDisplay } from '@/components/common/RobustErrorDisplay';

const meta: Meta<typeof RobustErrorDisplay> = {
  title: 'Common/RobustErrorDisplay',
  component: RobustErrorDisplay,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Composant d\'affichage d\'erreurs robuste avec actions de récupération, retry automatique et escalade d\'incidents.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'object',
      description: 'Objet erreur avec message, code et détails',
    },
    context: {
      control: 'text',
      description: 'Contexte de l\'erreur (extraction, music, auth, etc.)',
    },
    showRetry: {
      control: 'boolean',
      description: 'Afficher le bouton de retry',
    },
    showDetails: {
      control: 'boolean',
      description: 'Afficher les détails techniques',
    },
    onRetry: {
      action: 'retry',
      description: 'Callback appelé lors du retry',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NetworkError: Story = {
  args: {
    error: {
      message: 'Erreur de connexion réseau',
      code: 'NETWORK_ERROR',
      details: 'Impossible de joindre le serveur. Vérifiez votre connexion internet.',
    },
    context: 'extraction',
    showRetry: true,
    showDetails: true,
  },
};

export const AuthenticationError: Story = {
  args: {
    error: {
      message: 'Authentification échouée',
      code: 'AUTH_FAILED',
      details: 'Identifiants CAS invalides ou expirés.',
    },
    context: 'auth',
    showRetry: true,
    showDetails: false,
  },
};

export const QuotaExceeded: Story = {
  args: {
    error: {
      message: 'Quota API dépassé',
      code: 'QUOTA_EXCEEDED',
      details: 'Limite mensuelle atteinte. Renouvellement dans 12 jours.',
    },
    context: 'music',
    showRetry: false,
    showDetails: true,
  },
};

export const SystemError: Story = {
  args: {
    error: {
      message: 'Erreur système critique',
      code: 'SYSTEM_ERROR',
      details: 'Erreur interne du serveur. Équipe technique notifiée.',
    },
    context: 'system',
    showRetry: false,
    showDetails: true,
  },
};

export const ValidationError: Story = {
  args: {
    error: {
      message: 'Données invalides',
      code: 'VALIDATION_ERROR',
      details: 'Format de données incorrect. Vérifiez les champs requis.',
    },
    context: 'form',
    showRetry: true,
    showDetails: false,
  },
};

export const MinimalError: Story = {
  args: {
    error: {
      message: 'Une erreur est survenue',
    },
    showRetry: false,
    showDetails: false,
  },
};