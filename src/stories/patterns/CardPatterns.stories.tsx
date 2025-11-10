import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

const CardPatternsDemo = () => {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-3">Pattern 1: Carte avec bordure latérale colorée</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Utilisé pour les compétences EDN et contenus importants
        </p>
        <div className="space-y-4">
          <Card className="border-l-4 border-l-primary bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline">IC-001</Badge>
                <CardTitle className="text-primary">Compétence Principale</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Exemple d'une carte avec bordure latérale primary. Le fond utilise une transparence de 5%.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success bg-success/10">
            <CardContent className="p-4">
              <strong className="text-success">Exemple :</strong>
              <p className="text-sm mt-2">
                Section d'exemple pratique avec bordure success et fond à 10% d'opacité.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning bg-warning/10">
            <CardContent className="p-4">
              <strong className="text-warning">Note :</strong>
              <p className="text-sm mt-2">
                Section d'attention avec bordure warning et fond subtil.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Pattern 2: Carte de section</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Structure standard pour les sections de contenu
        </p>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Titre de Section
            </CardTitle>
            <CardDescription>
              Description de la section avec style cohérent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">
              Contenu principal de la carte avec texte foreground.
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary">Tag 1</Badge>
              <Badge variant="secondary">Tag 2</Badge>
              <Badge variant="secondary">Tag 3</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Pattern 3: Carte interactive</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Avec états hover et focus pour navigation
        </p>
        <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                  📚
                </div>
                <div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Items EDN
                  </CardTitle>
                  <CardDescription>367 items complets</CardDescription>
                </div>
              </div>
              <Badge variant="secondary">Complet</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-muted-foreground">Contenus officiels corrigés</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Anti-Pattern ❌</h3>
        <p className="text-sm text-destructive mb-4">
          NE PAS utiliser de couleurs hardcodées
        </p>
        <Card className="border-l-4 border-l-blue-500 bg-blue-50 opacity-50">
          <CardContent className="p-4">
            <code className="text-xs">border-l-blue-500 bg-blue-50</code>
            <p className="text-sm mt-2 text-blue-800">
              ❌ Couleurs hardcodées - ne s'adapte pas au mode sombre
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const meta = {
  title: 'Patterns/Card Patterns',
  component: CardPatternsDemo,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Patterns établis pour l\'utilisation des cartes dans l\'application. Tous ces patterns s\'adaptent automatiquement au mode clair/sombre.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CardPatternsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {};
