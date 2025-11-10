import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '@/components/ui/separator';

const meta = {
  title: 'UI/Layout/Separator',
  component: Separator,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Sépare visuellement le contenu en sections distinctes. Utilisable horizontalement ou verticalement avec support du design system.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientation du séparateur',
    },
    decorative: {
      control: 'boolean',
      description: 'Si true, le séparateur est purement décoratif (pas dans l\'arbre d\'accessibilité)',
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <div className="space-y-4 max-w-md">
      <div>
        <h3 className="text-lg font-semibold">Section 1</h3>
        <p className="text-sm text-muted-foreground">
          Contenu de la première section avec du texte descriptif.
        </p>
      </div>
      <Separator {...args} />
      <div>
        <h3 className="text-lg font-semibold">Section 2</h3>
        <p className="text-sm text-muted-foreground">
          Contenu de la seconde section avec du texte descriptif.
        </p>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="flex h-32 items-center space-x-4">
      <div className="flex-1">
        <h4 className="font-medium">Colonne 1</h4>
        <p className="text-sm text-muted-foreground">Contenu</p>
      </div>
      <Separator {...args} />
      <div className="flex-1">
        <h4 className="font-medium">Colonne 2</h4>
        <p className="text-sm text-muted-foreground">Contenu</p>
      </div>
      <Separator {...args} />
      <div className="flex-1">
        <h4 className="font-medium">Colonne 3</h4>
        <p className="text-sm text-muted-foreground">Contenu</p>
      </div>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="rounded-lg border bg-card p-6 max-w-md">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Détails du profil</h3>
          <p className="text-sm text-muted-foreground">Informations personnelles</p>
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nom</span>
            <span className="font-medium">Jean Dupont</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">jean.dupont@example.com</span>
          </div>
        </div>
        <Separator />
        <div className="text-xs text-muted-foreground">
          Dernière mise à jour : il y a 2 heures
        </div>
      </div>
    </div>
  ),
};

export const InMenu: Story = {
  render: () => (
    <div className="w-56 rounded-md border bg-popover p-1 shadow-lg">
      <div className="px-2 py-1.5 text-sm font-semibold">Mon compte</div>
      <Separator className="my-1" />
      <div className="space-y-1">
        <button className="w-full rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-left">
          Profil
        </button>
        <button className="w-full rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-left">
          Paramètres
        </button>
      </div>
      <Separator className="my-1" />
      <button className="w-full rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent text-left">
        Déconnexion
      </button>
    </div>
  ),
};

export const WithCustomSpacing: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div>
        <h3 className="text-lg font-semibold">Espacement personnalisé</h3>
        <p className="text-sm text-muted-foreground">my-6 (24px)</p>
      </div>
      <Separator className="my-6" />
      <div>
        <h3 className="text-lg font-semibold">Section suivante</h3>
        <p className="text-sm text-muted-foreground">Avec plus d'espace</p>
      </div>
      <Separator className="my-2" />
      <div>
        <h3 className="text-lg font-semibold">Espacement réduit</h3>
        <p className="text-sm text-muted-foreground">my-2 (8px)</p>
      </div>
    </div>
  ),
};
