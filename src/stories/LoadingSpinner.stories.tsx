import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Common/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Indicateur de chargement animé avec différentes tailles et styles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Taille du spinner',
    },
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'accent'],
      description: 'Variante de couleur',
    },
    text: {
      control: 'text',
      description: 'Texte optionnel affiché sous le spinner',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const WithText: Story = {
  args: {
    size: 'md',
    text: 'Chargement en cours...',
  },
};

export const Secondary: Story = {
  args: {
    size: 'md',
    variant: 'secondary',
    text: 'Traitement des données',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    text: 'Génération musicale en cours',
  },
};