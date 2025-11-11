import React, { useState } from 'react';
import { Moon, Sun, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/ui/theme-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const DesignSystem: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Color tokens
  const colorTokens = [
    { name: '--primary', description: 'Main brand color', class: 'bg-primary text-primary-foreground' },
    { name: '--secondary', description: 'Secondary UI elements', class: 'bg-secondary text-secondary-foreground' },
    { name: '--accent', description: 'Accent highlights', class: 'bg-accent text-accent-foreground' },
    { name: '--success', description: 'Success states', class: 'bg-success text-success-foreground' },
    { name: '--warning', description: 'Warning states', class: 'bg-warning text-warning-foreground' },
    { name: '--destructive', description: 'Error/destructive states', class: 'bg-destructive text-destructive-foreground' },
    { name: '--muted', description: 'Muted backgrounds', class: 'bg-muted text-muted-foreground' },
    { name: '--card', description: 'Card backgrounds', class: 'bg-card text-card-foreground' },
  ];

  // Component variants
  const buttonVariants = [
    { name: 'default', props: { variant: 'default' as const }, label: 'Default' },
    { name: 'secondary', props: { variant: 'secondary' as const }, label: 'Secondary' },
    { name: 'outline', props: { variant: 'outline' as const }, label: 'Outline' },
    { name: 'ghost', props: { variant: 'ghost' as const }, label: 'Ghost' },
    { name: 'destructive', props: { variant: 'destructive' as const }, label: 'Destructive' },
  ];

  const badgeVariants = [
    { name: 'default', props: { variant: 'default' as const }, label: 'Default' },
    { name: 'secondary', props: { variant: 'secondary' as const }, label: 'Secondary' },
    { name: 'outline', props: { variant: 'outline' as const }, label: 'Outline' },
    { name: 'destructive', props: { variant: 'destructive' as const }, label: 'Destructive' },
  ];

  const cardSizes = [
    { name: 'sm', class: 'p-3', label: 'Small' },
    { name: 'md', class: 'p-4', label: 'Medium' },
    { name: 'lg', class: 'p-6', label: 'Large' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-gradient-header backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Design System</h1>
              <p className="text-sm text-muted-foreground">Interactive token explorer & component showcase</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="gap-2"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tokens" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-8">
            {/* Color Tokens */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Color Tokens</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {colorTokens.map((token) => (
                  <Card key={token.name} className="overflow-hidden">
                    <div className={cn('h-24 flex items-center justify-center', token.class)}>
                      <span className="font-semibold">{token.name}</span>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">{token.description}</p>
                      <div className="flex items-center justify-between">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          hsl(var({token.name}))
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`hsl(var(${token.name}))`)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedToken === `hsl(var(${token.name}))` ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Gradient Tokens */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Gradient Tokens</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="overflow-hidden">
                  <div className="h-32 bg-gradient-medical flex items-center justify-center text-primary-foreground font-semibold">
                    --gradient-medical
                  </div>
                  <div className="p-4">
                    <code className="text-xs bg-muted px-2 py-1 rounded block">
                      background: var(--gradient-medical)
                    </code>
                  </div>
                </Card>
                <Card className="overflow-hidden">
                  <div className="h-32 bg-gradient-header flex items-center justify-center text-foreground font-semibold">
                    --gradient-header
                  </div>
                  <div className="p-4">
                    <code className="text-xs bg-muted px-2 py-1 rounded block">
                      background: var(--gradient-header)
                    </code>
                  </div>
                </Card>
              </div>
            </section>

            {/* Spacing Tokens */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Spacing & Border Radius</h2>
              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Border Radius</h3>
                  <div className="flex gap-4 flex-wrap">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary rounded-sm mb-2"></div>
                      <code className="text-xs">--radius-sm</code>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary rounded mb-2"></div>
                      <code className="text-xs">--radius</code>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary rounded-lg mb-2"></div>
                      <code className="text-xs">--radius-lg</code>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-8">
            {/* Buttons */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Button Variants</h2>
              <Card className="p-6">
                <div className="flex gap-4 flex-wrap">
                  {buttonVariants.map((variant) => (
                    <div key={variant.name} className="text-center space-y-2">
                      <Button {...variant.props}>{variant.label}</Button>
                      <code className="text-xs block text-muted-foreground">{variant.name}</code>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* Badges */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Badge Variants</h2>
              <Card className="p-6">
                <div className="flex gap-4 flex-wrap">
                  {badgeVariants.map((variant) => (
                    <div key={variant.name} className="text-center space-y-2">
                      <Badge {...variant.props}>{variant.label}</Badge>
                      <code className="text-xs block text-muted-foreground">{variant.name}</code>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* Cards */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Card Sizes</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {cardSizes.map((size) => (
                  <Card key={size.name} className={size.class}>
                    <h3 className="font-semibold text-foreground mb-2">{size.label} Card</h3>
                    <p className="text-sm text-muted-foreground">
                      This is a {size.label.toLowerCase()} card with {size.class} padding.
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Real-world Examples</h2>
              
              {/* Example 1: Status Card */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Status Dashboard</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="p-4 border-success/20 bg-success/5">
                    <Badge variant="outline" className="mb-2 border-success/20 text-success">Active</Badge>
                    <h4 className="font-semibold text-foreground">System Online</h4>
                    <p className="text-sm text-muted-foreground mt-1">All services operational</p>
                  </Card>
                  <Card className="p-4 border-warning/20 bg-warning/5">
                    <Badge variant="outline" className="mb-2 border-warning/20 text-warning-foreground">Warning</Badge>
                    <h4 className="font-semibold text-foreground">High Load</h4>
                    <p className="text-sm text-muted-foreground mt-1">CPU usage at 85%</p>
                  </Card>
                  <Card className="p-4 border-destructive/20 bg-destructive/5">
                    <Badge variant="destructive" className="mb-2">Error</Badge>
                    <h4 className="font-semibold text-foreground">Connection Lost</h4>
                    <p className="text-sm text-muted-foreground mt-1">Retrying in 10s...</p>
                  </Card>
                </div>
              </div>

              {/* Example 2: Action Card */}
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-medium text-foreground">Action Cards</h3>
                <Card className="p-6 bg-gradient-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-foreground mb-2">Get Started with Design System</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Explore our comprehensive design tokens, component library, and interactive examples.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="default">View Documentation</Button>
                        <Button variant="outline">Browse Components</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Press <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs">Ctrl+Shift+D</kbd> to open DevTools Inspector
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DesignSystem;
