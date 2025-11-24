import logger from '@/lib/logger';
import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const meta = {
  title: 'UI/Layout/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Zone de défilement stylisée avec une scrollbar personnalisée. Améliore l\'expérience utilisateur pour le contenu défilant.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-72 w-80 rounded-md border p-4">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold leading-none">Liste de tâches</h4>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>Tâche #{i + 1}</span>
            </div>
            {i < 49 && <Separator className="my-2" />}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="h-32 w-32 rounded-md bg-muted flex items-center justify-center"
          >
            <span className="font-semibold">Card {i + 1}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const TagsList: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Tags populaires</h3>
      <ScrollArea className="h-48 w-full rounded-md border">
        <div className="p-4">
          <div className="space-y-2">
            {[
              'React', 'TypeScript', 'JavaScript', 'Next.js', 'Tailwind CSS',
              'Node.js', 'Python', 'Docker', 'Kubernetes', 'AWS',
              'GraphQL', 'REST API', 'MongoDB', 'PostgreSQL', 'Redis',
              'Git', 'GitHub', 'CI/CD', 'Testing', 'Agile'
            ].map((tag) => (
              <div key={tag}>
                <div className="text-sm flex items-center justify-between py-1">
                  <span className="font-medium">{tag}</span>
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(Math.random() * 1000)} posts
                  </span>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  ),
};

export const MessageList: Story = {
  render: () => (
    <ScrollArea className="h-96 w-96 rounded-md border bg-card">
      <div className="p-4 space-y-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              U{i + 1}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Utilisateur {i + 1}</span>
                <span className="text-xs text-muted-foreground">Il y a {i + 1}h</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ceci est un message exemple numéro {i + 1}. Le contenu peut être plus ou moins long.
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const CodeBlock: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">example.tsx</span>
        <button className="text-xs text-muted-foreground hover:text-foreground">
          Copier
        </button>
      </div>
      <ScrollArea className="h-64 w-full rounded-md border bg-muted/50">
        <div className="p-4 font-mono text-sm">
          <pre>
{`import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Example() {
  return (
    <ScrollArea className="h-72 w-96">
      <div className="p-4">
        {/* Contenu défilant */}
        <p>Lorem ipsum dolor sit amet...</p>
      </div>
    </ScrollArea>
  );
}

// Plus de code...
const data = [1, 2, 3, 4, 5];
data.map(item => logger.debug(item));

// Encore plus de lignes
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item, 0);
}`}
          </pre>
        </div>
      </ScrollArea>
    </div>
  ),
};

export const SidebarNavigation: Story = {
  render: () => (
    <div className="flex gap-4">
      <ScrollArea className="h-96 w-64 rounded-md border bg-card">
        <div className="p-4 space-y-6">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Navigation</h4>
            <div className="space-y-1">
              {['Accueil', 'Projets', 'Équipe', 'Paramètres'].map((item) => (
                <button
                  key={item}
                  className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="mb-2 text-sm font-semibold">Projets</h4>
            <div className="space-y-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <button
                  key={i}
                  className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent"
                >
                  Projet {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="flex-1 rounded-md border bg-card p-6">
        <h3 className="text-lg font-semibold mb-2">Contenu principal</h3>
        <p className="text-sm text-muted-foreground">
          La barre latérale est scrollable avec une scrollbar stylisée
        </p>
      </div>
    </div>
  ),
};
