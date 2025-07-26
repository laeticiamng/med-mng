import type { Meta, StoryObj } from '@storybook/react';
import { SkeletonLibraryGrid, SkeletonExtractionDashboard, SkeletonLoading } from '@/components/ui/skeletons';

const meta = {
  title: 'UI/Skeletons',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Composants skeleton pour améliorer l\'UX pendant les chargements.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const LibraryGrid: StoryObj = {
  render: () => <SkeletonLibraryGrid count={8} />,
  parameters: {
    docs: {
      description: {
        story: 'Skeleton de la grille de bibliothèque avec animation shimmer.',
      },
    },
  },
};

export const ExtractionDashboard: StoryObj = {
  render: () => <SkeletonExtractionDashboard count={4} />,
  parameters: {
    docs: {
      description: {
        story: 'Skeleton du dashboard d\'extraction avec métriques.',
      },
    },
  },
};

export const LoadingWithDelay: StoryObj = {
  render: () => <SkeletonLoading text="Chargement des données..." delay={2000} />,
  parameters: {
    docs: {
      description: {
        story: 'Loading avec message d\'attente après délai (2s ici pour la demo).',
      },
    },
  },
};