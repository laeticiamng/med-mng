import type { Meta, StoryObj } from '@storybook/react';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

const meta = {
  title: 'Navigation/MobileBottomNav',
  component: MobileBottomNav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Navigation mobile en bas d\'écran avec 5 onglets principaux.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MobileBottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Contenu de la page</h1>
        <p className="mb-4">
          Redimensionnez la fenêtre en mode mobile pour voir la navigation en bas.
        </p>
        <div className="space-y-4">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium">Élément {i + 1}</h3>
              <p className="text-sm text-muted-foreground">Contenu de test</p>
            </div>
          ))}
        </div>
      </div>
      <MobileBottomNav />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};