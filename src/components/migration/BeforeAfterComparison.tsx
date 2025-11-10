import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Code2, 
  Palette, 
  CheckCircle2,
  XCircle,
  Lightbulb
} from 'lucide-react';

interface CodeExample {
  id: string;
  title: string;
  category: string;
  before: string;
  after: string;
  explanation: string;
  benefits: string[];
}

export const BeforeAfterComparison: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('colors');

  const examples: CodeExample[] = [
    {
      id: 'text-colors',
      title: 'Couleurs de Texte',
      category: 'colors',
      before: `// ❌ Couleurs hardcodées
<div className="text-gray-900">
  <h1 className="text-blue-600">Titre</h1>
  <p className="text-gray-600">Description</p>
  <span className="text-red-600">Erreur</span>
  <span className="text-green-600">Succès</span>
</div>`,
      after: `// ✅ Tokens sémantiques
<div className="text-foreground">
  <h1 className="text-primary">Titre</h1>
  <p className="text-muted-foreground">Description</p>
  <span className="text-destructive">Erreur</span>
  <span className="text-success">Succès</span>
</div>`,
      explanation: 'Les tokens sémantiques s\'adaptent automatiquement au thème (clair/sombre)',
      benefits: [
        'Compatible dark mode automatique',
        'Maintenance simplifiée',
        'Cohérence garantie',
        'Accessible WCAG AA'
      ]
    },
    {
      id: 'backgrounds',
      title: 'Arrière-plans',
      category: 'colors',
      before: `// ❌ Backgrounds hardcodés
<div className="bg-white">
  <Card className="bg-gray-50 border-gray-200">
    <div className="bg-blue-100 text-blue-800">
      Notification
    </div>
  </Card>
</div>`,
      after: `// ✅ Tokens sémantiques
<div className="bg-background">
  <Card className="bg-card border-border">
    <div className="bg-primary/10 text-primary">
      Notification
    </div>
  </Card>
</div>`,
      explanation: 'Les backgrounds utilisent des surfaces adaptatives pour tous les modes',
      benefits: [
        'Contraste optimal en mode sombre',
        'Surfaces bien définies',
        'Moins de bugs visuels',
        'Thème centralisé'
      ]
    },
    {
      id: 'gradients',
      title: 'Gradients',
      category: 'gradients',
      before: `// ❌ Gradients complexes
<div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
  <h2>Hero Section</h2>
</div>

<div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
  Contenu
</div>`,
      after: `// ✅ Gradients du design system
<div className="bg-gradient-medical text-primary-foreground">
  <h2>Hero Section</h2>
</div>

<div className="bg-gradient-subtle">
  Contenu
</div>`,
      explanation: 'Gradients prédéfinis dans index.css pour une cohérence visuelle',
      benefits: [
        'Identité visuelle cohérente',
        'Moins de code répétitif',
        'Facilement modifiable',
        'Performance optimale'
      ]
    },
    {
      id: 'status-colors',
      title: 'Couleurs de Statut',
      category: 'status',
      before: `// ❌ Couleurs de statut hardcodées
const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'text-green-600 bg-green-100';
    case 'error':
      return 'text-red-600 bg-red-100';
    case 'warning':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};`,
      after: `// ✅ Tokens sémantiques
const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'text-success bg-success/10';
    case 'error':
      return 'text-destructive bg-destructive/10';
    case 'warning':
      return 'text-warning bg-warning/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
};`,
      explanation: 'Couleurs de statut sémantiques avec opacité contrôlée',
      benefits: [
        'Signification universelle',
        'Contraste garanti',
        'Accessible daltoniens',
        'Dark mode optimal'
      ]
    },
    {
      id: 'borders',
      title: 'Bordures',
      category: 'layout',
      before: `// ❌ Bordures hardcodées
<div className="border-gray-200 hover:border-blue-500">
  <Card className="border-t border-gray-300">
    <Separator className="border-gray-200" />
  </Card>
</div>`,
      after: `// ✅ Tokens sémantiques
<div className="border-border hover:border-primary">
  <Card className="border-t border-border">
    <Separator className="border-border" />
  </Card>
</div>`,
      explanation: 'Bordures unifiées qui s\'adaptent au contexte',
      benefits: [
        'Cohérence visuelle',
        'Visible en dark mode',
        'Une seule variable à changer',
        'Moins d\'erreurs'
      ]
    },
    {
      id: 'hover-states',
      title: 'États Hover',
      category: 'interactive',
      before: `// ❌ États hover incohérents
<Button className="hover:bg-gray-100 text-gray-900">
  Action
</Button>

<Link className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
  Lien
</Link>`,
      after: `// ✅ États hover sémantiques
<Button className="hover:bg-accent text-foreground">
  Action
</Button>

<Link className="text-primary hover:text-primary/90 hover:bg-accent">
  Lien
</Link>`,
      explanation: 'États interactifs cohérents pour tous les éléments cliquables',
      benefits: [
        'Feedback visuel uniforme',
        'Expérience utilisateur cohérente',
        'Accessible au clavier',
        'Performance optimale'
      ]
    }
  ];

  const categories = [
    { id: 'colors', label: 'Couleurs', count: 2 },
    { id: 'gradients', label: 'Gradients', count: 1 },
    { id: 'status', label: 'Statuts', count: 1 },
    { id: 'layout', label: 'Layout', count: 1 },
    { id: 'interactive', label: 'Interactif', count: 1 }
  ];

  const filteredExamples = examples.filter(ex => ex.category === selectedCategory);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Comparaison Avant / Après
          </CardTitle>
          <CardDescription>
            Exemples concrets de migration des patterns hardcodés vers les tokens sémantiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Catégories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {cat.label}
                <Badge variant="secondary" className="ml-2">
                  {cat.count}
                </Badge>
              </button>
            ))}
          </div>

          {/* Exemples */}
          <div className="space-y-6">
            {filteredExamples.map((example) => (
              <Card key={example.id} className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    {example.title}
                  </CardTitle>
                  <CardDescription>{example.explanation}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Avant */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-semibold text-destructive">Avant</span>
                      </div>
                      <pre className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg text-xs overflow-x-auto">
                        <code>{example.before}</code>
                      </pre>
                    </div>

                    {/* Flèche */}
                    <div className="hidden lg:flex items-center justify-center">
                      <ArrowRight className="w-8 h-8 text-primary" />
                    </div>

                    {/* Après */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-sm font-semibold text-success">Après</span>
                      </div>
                      <pre className="bg-success/5 border border-success/20 p-4 rounded-lg text-xs overflow-x-auto">
                        <code>{example.after}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Bénéfices */}
                  <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Bénéfices</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {example.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guide de référence */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">📚 Guide de Référence Rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Texte</p>
              <code className="block bg-background p-2 rounded mb-1">text-gray-* → text-foreground</code>
              <code className="block bg-background p-2 rounded mb-1">text-gray-500 → text-muted-foreground</code>
            </div>
            <div>
              <p className="font-semibold mb-2">Backgrounds</p>
              <code className="block bg-background p-2 rounded mb-1">bg-white → bg-card</code>
              <code className="block bg-background p-2 rounded mb-1">bg-gray-50 → bg-muted</code>
            </div>
            <div>
              <p className="font-semibold mb-2">Statuts</p>
              <code className="block bg-background p-2 rounded mb-1">text-green-* → text-success</code>
              <code className="block bg-background p-2 rounded mb-1">text-red-* → text-destructive</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
