import type { Meta, StoryObj } from '@storybook/react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const meta = {
  title: 'UI/Layout/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Panneaux redimensionnables permettant aux utilisateurs d\'ajuster la taille des sections. Idéal pour les interfaces complexes comme les éditeurs de code.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="min-h-[300px] rounded-lg border">
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Panneau gauche</h3>
            <p className="text-sm text-muted-foreground">
              Redimensionnable horizontalement
            </p>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Panneau droit</h3>
            <p className="text-sm text-muted-foreground">
              Ajustez la taille avec la poignée
            </p>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup direction="vertical" className="min-h-[500px] rounded-lg border">
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Panneau supérieur</h3>
            <p className="text-sm text-muted-foreground">
              Redimensionnable verticalement
            </p>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Panneau inférieur</h3>
            <p className="text-sm text-muted-foreground">
              Ajustez la hauteur avec la poignée
            </p>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const ThreePanels: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="min-h-[300px] rounded-lg border">
      <ResizablePanel defaultSize={25} minSize={15}>
        <div className="flex h-full items-center justify-center p-6 bg-muted/50">
          <span className="font-semibold">Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Contenu principal</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25} minSize={15}>
        <div className="flex h-full items-center justify-center p-6 bg-muted/50">
          <span className="font-semibold">Panel droit</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const NestedPanels: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="min-h-[400px] rounded-lg border">
      <ResizablePanel defaultSize={30} minSize={20}>
        <div className="flex h-full items-center justify-center p-6 bg-muted/30">
          <span className="font-semibold">Navigation</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Éditeur</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40} minSize={20}>
            <div className="flex h-full items-center justify-center p-6 bg-muted/30">
              <span className="font-semibold">Console</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const WithoutHandle: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="min-h-[300px] rounded-lg border">
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Sans poignée visible</h3>
            <p className="text-sm text-muted-foreground">
              Glissez sur la bordure pour redimensionner
            </p>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex h-full items-center justify-center p-6 bg-muted/50">
          <span className="font-semibold">Interface minimaliste</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const IDELayout: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="min-h-[500px] rounded-lg border">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="h-full bg-muted/30 p-4">
          <h4 className="font-semibold mb-3">Explorateur</h4>
          <div className="space-y-2 text-sm">
            <div className="hover:bg-accent p-1 rounded cursor-pointer">📁 src</div>
            <div className="hover:bg-accent p-1 rounded cursor-pointer pl-4">📄 App.tsx</div>
            <div className="hover:bg-accent p-1 rounded cursor-pointer pl-4">📄 main.tsx</div>
            <div className="hover:bg-accent p-1 rounded cursor-pointer">📁 components</div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70} minSize={40}>
            <div className="h-full p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">App.tsx</span>
                <span className="text-xs text-muted-foreground">TypeScript</span>
              </div>
              <div className="font-mono text-sm space-y-1">
                <div className="text-muted-foreground">1  import React from 'react';</div>
                <div className="text-muted-foreground">2  </div>
                <div className="text-muted-foreground">3  export default function App() {`{`}</div>
                <div className="text-muted-foreground">4    return &lt;div&gt;Hello&lt;/div&gt;</div>
                <div className="text-muted-foreground">5  {`}`}</div>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} minSize={15}>
            <div className="h-full bg-muted/30 p-4">
              <h4 className="font-semibold mb-3 text-sm">Terminal</h4>
              <div className="font-mono text-xs text-muted-foreground">
                $ npm run dev
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="h-full bg-muted/30 p-4">
          <h4 className="font-semibold mb-3">Propriétés</h4>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Largeur</div>
              <div className="font-medium">100%</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Hauteur</div>
              <div className="font-medium">auto</div>
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
