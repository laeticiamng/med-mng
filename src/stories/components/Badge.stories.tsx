import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Badges pour afficher des statuts, catégories et informations compactes. Tous les variants s\'adaptent au mode clair/sombre.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Style du badge',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondaire',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Erreur',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default (Primary)</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge className="bg-success text-success-foreground">Success</Badge>
      <Badge className="bg-warning text-warning-foreground">Warning</Badge>
      <Badge className="bg-accent text-accent-foreground">Accent</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tous les variants de badges disponibles, incluant les variants personnalisés avec tokens sémantiques.',
      },
    },
  },
};

export const EDNContext: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <div className="flex items-center gap-2">
        <Badge className="bg-primary">Rang A</Badge>
        <span className="text-sm">Compétences fondamentales</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-accent">Rang B</Badge>
        <span className="text-sm">Compétences approfondies</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-success text-success-foreground">Validé</Badge>
        <span className="text-sm">Contenu vérifié</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-warning text-warning-foreground">En cours</Badge>
        <span className="text-sm">Génération musicale</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges utilisés dans le contexte EDN pour indiquer les rangs et statuts de contenu.',
      },
    },
  },
};
