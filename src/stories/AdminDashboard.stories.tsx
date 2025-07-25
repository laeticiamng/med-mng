import type { Meta, StoryObj } from '@storybook/react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

const meta: Meta<typeof AdminDashboard> = {
  title: 'Admin/AdminDashboard',
  component: AdminDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Dashboard d\'administration temps réel avec monitoring des extractions, métriques système et gestion des alertes.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Dashboard par défaut avec toutes les sections actives.',
      },
    },
  },
};

export const WithActiveExtractions: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Dashboard avec extractions en cours - simule des données temps réel.',
      },
    },
  },
};

export const ErrorState: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Dashboard en état d\'erreur avec alertes système.',
      },
    },
  },
};