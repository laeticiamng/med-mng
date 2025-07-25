import type { Meta, StoryObj } from '@storybook/react';
import { NotificationCenter } from '@/components/common/NotificationCenter';

const meta: Meta<typeof NotificationCenter> = {
  title: 'Common/NotificationCenter',
  component: NotificationCenter,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Centre de notifications intelligent avec gestion des priorités, auto-dismiss et groupement par type.',
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
        story: 'Centre de notifications par défaut avec quelques notifications de test.',
      },
    },
  },
};

export const WithManyNotifications: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Centre avec plusieurs notifications de différents types et priorités.',
      },
    },
  },
};

export const EmptyState: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'État vide du centre de notifications.',
      },
    },
  },
};