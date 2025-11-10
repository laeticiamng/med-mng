import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const meta = {
  title: 'Components/Feedback/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Squelettes de chargement pour indiquer le chargement de contenu. Animation pulse automatique.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-[250px]" />,
};

export const Circular: Story = {
  render: () => <Skeleton className="h-12 w-12 rounded-full" />,
};

export const TextBlock: Story = {
  render: () => (
    <div className="space-y-2 w-[400px]">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Bloc de texte en chargement.',
      },
    },
  },
};

export const CardSkeleton: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Carte complète en chargement.',
      },
    },
  },
};

export const ProfileSkeleton: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Profil utilisateur en chargement.',
      },
    },
  },
};

export const ListSkeleton: Story = {
  render: () => (
    <div className="w-[500px] space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Liste d\'éléments en chargement.',
      },
    },
  },
};

export const TableSkeleton: Story = {
  render: () => (
    <div className="w-[600px] space-y-3">
      <div className="flex items-center justify-between p-3 border-b">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4 p-3 border-b">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tableau de données en chargement.',
      },
    },
  },
};

export const ImageGallerySkeleton: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 w-[600px]">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Galerie d\'images en chargement.',
      },
    },
  },
};

export const DashboardSkeleton: Story = {
  render: () => (
    <div className="w-[700px] space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard complet en chargement.',
      },
    },
  },
};

export const CommentSkeleton: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-start space-x-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Section de commentaires en chargement.',
      },
    },
  },
};
