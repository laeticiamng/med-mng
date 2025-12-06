import type { Meta, StoryObj } from '@storybook/react';

const TokensDisplay = () => {
  const colorTokens = [
    { name: 'primary', var: '--primary', description: 'Couleur principale (bleu)' },
    { name: 'secondary', var: '--secondary', description: 'Couleur secondaire (gris)' },
    { name: 'accent', var: '--accent', description: 'Couleur d\'accent (violet)' },
    { name: 'success', var: '--success', description: 'Succès et validation (vert)' },
    { name: 'warning', var: '--warning', description: 'Attention et créativité (orange)' },
    { name: 'destructive', var: '--destructive', description: 'Erreurs et dangers (rouge)' },
    { name: 'muted', var: '--muted', description: 'Textes et fonds secondaires (gris)' },
    { name: 'border', var: '--border', description: 'Bordures et séparateurs' },
  ];

  const gradients = [
    { name: 'gradient-primary', class: 'bg-gradient-primary', description: 'Dégradé principal' },
    { name: 'gradient-medical', class: 'bg-gradient-medical', description: 'Dégradé médical' },
    { name: 'gradient-success', class: 'bg-gradient-success', description: 'Dégradé succès' },
    { name: 'gradient-subtle', class: 'bg-gradient-subtle', description: 'Dégradé subtil' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Couleurs Sémantiques</h2>
        <p className="text-muted-foreground mb-6">
          Ces tokens s'adaptent automatiquement au mode clair/sombre.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colorTokens.map((token) => (
            <div key={token.name} className="border rounded-lg p-4">
              <div className="flex items-center gap-4 mb-2">
                <div 
                  className={`w-12 h-12 rounded border bg-${token.name}`}
                  style={{ backgroundColor: `hsl(var(${token.var}))` }}
                />
                <div>
                  <div className="font-mono text-sm">--{token.name}</div>
                  <div className="text-xs text-muted-foreground">{token.description}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">bg-{token.name}</code>
                  <div className={`w-8 h-6 rounded bg-${token.name}`} />
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">text-{token.name}</code>
                  <div className={`text-${token.name} font-bold`}>Aa</div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">border-{token.name}</code>
                  <div className={`w-8 h-6 rounded border-2 border-${token.name}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Dégradés</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gradients.map((gradient) => (
            <div key={gradient.name} className="border rounded-lg overflow-hidden">
              <div className={`${gradient.class} h-24`} />
              <div className="p-4">
                <div className="font-mono text-sm mb-1">{gradient.name}</div>
                <div className="text-xs text-muted-foreground mb-2">{gradient.description}</div>
                <code className="text-xs bg-muted px-2 py-1 rounded">{gradient.class}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Transparence</h2>
        <p className="text-muted-foreground mb-4">
          Utilisez la transparence pour créer des variants subtils :
        </p>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="font-medium mb-2">Fonds de cartes</div>
            <div className="flex gap-2">
              <div className="bg-primary/5 px-4 py-2 rounded">
                <code className="text-xs">bg-primary/5</code>
              </div>
              <div className="bg-primary/10 px-4 py-2 rounded">
                <code className="text-xs">bg-primary/10</code>
              </div>
              <div className="bg-primary/20 px-4 py-2 rounded">
                <code className="text-xs">bg-primary/20</code>
              </div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="font-medium mb-2">États hover</div>
            <div className="flex gap-2">
              <button className="bg-primary hover:bg-primary/90 px-4 py-2 rounded text-primary-foreground">
                hover:bg-primary/90
              </button>
              <button className="bg-success hover:bg-success/90 px-4 py-2 rounded text-success-foreground">
                hover:bg-success/90
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta = {
  title: 'Design System/Tokens',
  component: TokensDisplay,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Tokens de couleurs sémantiques utilisés dans toute l\'application. Testez en mode clair/sombre avec le sélecteur en haut.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TokensDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTokens: Story = {};
