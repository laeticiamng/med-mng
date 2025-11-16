import type { Meta, StoryObj } from '@storybook/react';
import { AlertBanner } from '@/components/common/AlertBanner';

const meta: Meta<typeof AlertBanner> = {
  title: 'Common/AlertBanner',
  component: AlertBanner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Bannière d\'alerte système intelligente avec auto-hide et gestion des priorités.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error', 'system'],
      description: 'Type d\'alerte déterminant l\'apparence et le comportement',
    },
    message: {
      control: 'text',
      description: 'Message principal de l\'alerte',
    },
    details: {
      control: 'text',
      description: 'Détails optionnels affichés en plus petit',
    },
    autoHide: {
      control: 'boolean',
      description: 'Masquage automatique après délai',
    },
    priority: {
      control: 'select',
      options: ['low', 'medium', 'high', 'critical'],
      description: 'Priorité de l\'alerte',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    type: 'info',
    message: 'Nouvelle fonctionnalité disponible',
    details: 'La génération musicale IA est maintenant activée pour tous les utilisateurs.',
  },
};

export const Success: Story = {
  args: {
    type: 'success',
    message: 'Extraction terminée avec succès',
    details: '2,847 objectifs extraits et traités en 3m 42s.',
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    message: 'Quota API bientôt atteint',
    details: 'Il vous reste 15% de votre quota mensuel. Surveillez votre utilisation.',
    priority: 'medium',
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    message: 'Échec de l\'extraction OIC',
    details: 'Erreur de connexion au serveur CAS. Vérifiez vos identifiants.',
    priority: 'high',
  },
};

export const Critical: Story = {
  args: {
    type: 'error',
    message: 'Incident sécurité détecté',
    details: 'Tentative d\'accès non autorisé bloquée. Équipe sécurité notifiée.',
    priority: 'critical',
    autoHide: false,
  },
};

export const SystemMaintenance: Story = {
  args: {
    type: 'system',
    message: 'Maintenance programmée',
    details: 'Le système sera indisponible de 02h00 à 04h00 pour maintenance.',
    autoHide: false,
  },
};

export const AutoHide: Story = {
  args: {
    type: 'info',
    message: 'Message temporaire',
    details: 'Cette alerte disparaîtra automatiquement dans 5 secondes.',
    autoHide: true,
  },
};