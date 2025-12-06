import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Search, HelpCircle, ExternalLink, Code, AlertCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'installation' | 'development' | 'debugging' | 'deployment' | 'troubleshooting';
  tags: string[];
  priority: 'high' | 'medium' | 'low';
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Comment démarrer le projet en local ?',
    answer: `
1. Cloner le repository: \`git clone [repo-url]\`
2. Installer les dépendances: \`pnpm install\`
3. Configurer les variables d'environnement dans \`.env.local\`
4. Démarrer le serveur de développement: \`pnpm dev\`
5. Ouvrir http://localhost:5173

**Prérequis:** Node.js 20+, pnpm 8+
`,
    category: 'installation',
    tags: ['setup', 'local', 'dev'],
    priority: 'high'
  },
  {
    id: '2',
    question: 'Les tests E2E échouent, que faire ?',
    answer: `
**Vérifications rapides:**
1. \`pnpm playwright install --with-deps\` pour installer les navigateurs
2. Vérifier que le serveur de dev tourne sur le bon port
3. Contrôler les variables d'environnement E2E dans \`.env.test\`

**Debug avancé:**
- \`pnpm test:e2e:debug\` pour mode debug
- \`pnpm test:e2e:headed\` pour voir le navigateur
- Vérifier les logs dans \`playwright-report/\`

**Variables critiques:**
- \`E2E_BASE_URL=https://yaincoxihiqdksxgrsrk.supabase.co\`
- \`SUPABASE_ANON_KEY=[voir .env.test]\`
`,
    category: 'debugging',
    tags: ['playwright', 'e2e', 'tests'],
    priority: 'high'
  },
  {
    id: '3',
    question: 'Erreurs TypeScript avec les composants Shadcn ?',
    answer: `
**Problèmes courants:**

1. **Import manquant:** Toujours importer React pour JSX
\`\`\`tsx
import React from 'react';
import { Button } from '@/components/ui/button';
\`\`\`

2. **Props TypeScript:** Utiliser les types corrects
\`\`\`tsx
interface Props {
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}
\`\`\`

3. **Stories Storybook:** Extension .tsx (pas .ts) pour JSX
\`\`\`tsx
// ✅ Button.stories.tsx
// ❌ Button.stories.ts
\`\`\`
`,
    category: 'development',
    tags: ['typescript', 'shadcn', 'components'],
    priority: 'medium'
  },
  {
    id: '4',
    question: 'Comment débugger les erreurs Sentry ?',
    answer: `
**Configuration Sentry:**
1. Configurer le DSN dans \`src/utils/sentry.ts\`
2. Initialiser Sentry au démarrage de l'app
3. Utiliser \`SentryErrorMonitor\` pour voir les erreurs en temps réel

**Debug local:**
- Les erreurs simulées apparaissent toutes les 30s en mode dev
- Utiliser \`Sentry.captureException()\` pour tester manuellement
- Vérifier la console pour les erreurs de configuration

**Production:**
- Filtrage automatique des erreurs non critiques
- Context utilisateur ajouté automatiquement
- Breadcrumbs pour tracer les actions utilisateur
`,
    category: 'debugging',
    tags: ['sentry', 'monitoring', 'errors'],
    priority: 'medium'
  },
  {
    id: '5',
    question: 'Performance Web Vitals dégradée ?',
    answer: `
**Diagnostic avec PerformanceMonitor:**
1. Ouvrir le dashboard performance intégré
2. Identifier les métriques en rouge/orange
3. Suivre les recommandations automatiques

**Optimisations par métrique:**
- **CLS (>0.25):** Éviter les shifts de layout, tailles fixes pour images
- **LCP (>4s):** Optimiser les ressources critiques, lazy loading
- **INP (>500ms):** Réduire le JavaScript, débouncer les interactions
- **FCP (>3s):** Minimiser le CSS bloquant, fonts preload
- **TTFB (>1.8s):** Optimiser le serveur, CDN, cache

**Outils:**
- Lighthouse CI intégré au pipeline
- \`pnpm build && pnpm preview\` pour tester la prod
`,
    category: 'troubleshooting',
    tags: ['performance', 'web-vitals', 'lighthouse'],
    priority: 'high'
  },
  {
    id: '6',
    question: 'Échec du pipeline CI/CD, comment investiguer ?',
    answer: `
**Étapes de diagnostic:**

1. **Identifier l'étape qui échoue:**
   - 🔒 Security Audit → Secrets hardcodés détectés
   - 🧹 Lint & TypeCheck → Erreurs ESLint/TypeScript
   - 🧪 Tests → Tests unitaires/E2E en échec
   - 🏗️ Build → Erreurs de compilation
   - ⚡ Performance → Scores Lighthouse trop bas

2. **Reproduire localement:**
\`\`\`bash
pnpm lint          # Vérifier lint
pnpm test          # Tests unitaires
pnpm test:e2e      # Tests E2E
pnpm build         # Build production
\`\`\`

3. **Logs GitHub Actions:**
   - Cliquer sur l'étape rouge dans Actions
   - Télécharger les artifacts si disponibles
   - Vérifier les variables d'environnement

**Blocages courants:**
- Variables d'env manquantes en CI
- Timeout tests E2E (augmenter dans playwright.config.ts)
- Secrets mal configurés
`,
    category: 'deployment',
    tags: ['ci-cd', 'github-actions', 'pipeline'],
    priority: 'high'
  },
  {
    id: '7',
    question: 'Storybook ne démarre pas ou erreurs de build ?',
    answer: `
**Configuration Storybook:**
1. Vérifier \`.storybook/main.ts\` et \`.storybook/preview.ts\`
2. S'assurer que les stories ont l'extension \`.tsx\` (pas \`.ts\`)
3. Import React nécessaire dans chaque story

**Commandes utiles:**
\`\`\`bash
pnpm storybook          # Démarrer Storybook
pnpm build-storybook    # Build statique
\`\`\`

**Erreurs courantes:**
- Addons manquants dans main.ts
- CSS non importé dans preview.ts
- Paths TypeScript non résolus
- Components avec props manquantes

**Structure recommandée:**
\`\`\`
src/stories/
├── Button.stories.tsx
├── Card.stories.tsx
└── Introduction.stories.mdx
\`\`\`
`,
    category: 'development',
    tags: ['storybook', 'documentation', 'components'],
    priority: 'medium'
  },
  {
    id: '8',
    question: 'Problèmes de génération musicale avec Suno API ?',
    answer: `
**Diagnostic erreurs Suno:**

1. **Quota atteint:** Vérifier les limites API dans le dashboard Suno
2. **Timeout:** Edge function timeout à 30s, génération peut prendre plus
3. **Format invalide:** Vérifier les paroles et paramètres envoyés

**Debug local:**
\`\`\`bash
# Tester directement l'edge function
curl -X POST "https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/generate-music" \\
  -H "Authorization: Bearer [ANON_KEY]" \\
  -H "Content-Type: application/json" \\
  -d '{"lyrics": "test", "style": "pop", "rang": "A", "duration": 120}'
\`\`\`

**Logs Edge Functions:**
- Dashboard Supabase → Functions → generate-music → Logs
- Erreurs API externes visibles dans les logs
- Context de debug ajouté automatiquement

**Gestion d'erreur:**
- UI affiche automatiquement les quotas
- Retry automatique avec backoff
- Fallback gracieux si API indisponible
`,
    category: 'troubleshooting',
    tags: ['suno', 'api', 'generation', 'music'],
    priority: 'high'
  },
  {
    id: '9',
    question: 'Comment contribuer au projet ?',
    answer: `
**Workflow de contribution:**

1. **Setup développement:**
   - Fork du repository
   - \`pnpm install && pnpm dev\`
   - Vérifier que tous les tests passent

2. **Standards de code:**
   - ESLint + Prettier configurés
   - Tests obligatoires pour nouvelles features
   - TypeScript strict mode
   - Documentation dans Storybook

3. **Process de PR:**
   - Feature branch depuis \`develop\`
   - Tests E2E passants obligatoires
   - Review par 1+ développeurs
   - Pipeline CI vert avant merge

4. **Conventions:**
   - Commits conventionnels (feat:, fix:, docs:)
   - Components dans \`src/components/\`
   - Stories dans \`src/stories/\`
   - Tests E2E dans \`tests/e2e/\`

**Contacts:**
- GitHub Issues pour bugs
- Discussions pour features
- Pull Requests pour contributions
`,
    category: 'development',
    tags: ['contribution', 'git', 'workflow'],
    priority: 'low'
  }
];

export const TroubleshootingFAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<string[]>(['1', '2']); // Ouvrir les 2 premiers par défaut

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'installation', label: 'Installation' },
    { value: 'development', label: 'Développement' },
    { value: 'debugging', label: 'Debug' },
    { value: 'deployment', label: 'Déploiement' },
    { value: 'troubleshooting', label: 'Dépannage' }
  ];

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedFAQ = filteredFAQ.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'installation': return <Code className="h-4 w-4" />;
      case 'debugging': return <AlertCircle className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          FAQ & Troubleshooting MED-MNG
        </CardTitle>
        <CardDescription>
          Guide complet pour résoudre les problèmes courants de développement et déploiement
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Filtres */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans la FAQ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category.value}
                  variant={selectedCategory === category.value ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Statistiques */}
          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{faqData.length}</div>
                <div className="text-sm text-primary/80">Questions totales</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {faqData.filter(f => f.priority === 'high').length}
                </div>
                <div className="text-sm text-primary/80">Priorité haute</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{filteredFAQ.length}</div>
                <div className="text-sm text-primary/80">Résultats filtrés</div>
              </div>
            </div>
          </Card>

          {/* FAQ Items */}
          <div className="space-y-3">
            {sortedFAQ.length === 0 ? (
              <Card className="p-6 text-center">
                <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Aucun résultat trouvé</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Essayez d'autres mots-clés ou changez de catégorie
                </p>
              </Card>
            ) : (
              sortedFAQ.map((item) => (
                <Collapsible 
                  key={item.id}
                  open={openItems.includes(item.id)}
                  onOpenChange={() => toggleItem(item.id)}
                >
                  <Card className="overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getCategoryIcon(item.category)}
                            <div className="flex-1">
                              <CardTitle className="text-left text-base">
                                {item.question}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                                <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                                  {item.priority}
                                </Badge>
                                {item.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`h-4 w-4 transition-transform ${
                            openItems.includes(item.id) ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {item.answer}
                          </pre>
                        </div>
                        
                        {item.tags.length > 2 && (
                          <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t">
                            <span className="text-xs text-muted-foreground mr-2">Tags:</span>
                            {item.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))
            )}
          </div>

          {/* Liens utiles */}
          <Card className="p-4 border-success/30 bg-success/5">
            <CardTitle className="text-sm text-success mb-3">
              Liens utiles
            </CardTitle>
            <div className="space-y-2 text-sm">
              <a 
                href="https://github.com/med-mng/med-mng/issues" 
                className="flex items-center gap-2 text-success hover:text-success/80"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3" />
                Reporter un bug (GitHub Issues)
              </a>
              <a 
                href="https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk" 
                className="flex items-center gap-2 text-success hover:text-success/80"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3" />
                Dashboard Supabase
              </a>
              <a 
                href="https://docs.lovable.dev/tips-tricks/troubleshooting" 
                className="flex items-center gap-2 text-success hover:text-success/80"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3" />
                Documentation Lovable
              </a>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};