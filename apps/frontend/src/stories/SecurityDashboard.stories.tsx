import type { Meta, StoryObj } from '@storybook/react';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';

const meta: Meta<typeof SecurityDashboard> = {
  title: 'Security/SecurityDashboard',
  component: SecurityDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Dashboard de sécurité avec validation automatique, scoring en temps réel et recommandations d\'amélioration.',
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
        story: 'Dashboard de sécurité par défaut avec validation automatique.',
      },
    },
  },
};

export const HighSecurityScore: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Dashboard avec score de sécurité élevé (Grade A).',
      },
    },
  },
};

export const WithSecurityIssues: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Dashboard montrant des problèmes de sécurité détectés.',
      },
    },
  },
};