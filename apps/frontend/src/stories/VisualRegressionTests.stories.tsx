import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * Visual Regression Tests for Design System
 * 
 * Ces stories sont utilisées pour les tests visuels automatisés avec Chromatic.
 * Elles capturent des screenshots de tous les composants en light et dark mode.
 */

const meta = {
  title: 'Visual Regression/All Components',
  parameters: {
    layout: 'padded',
    chromatic: {
      // Capture screenshots en light ET dark mode
      modes: {
        light: {
          theme: 'light',
        },
        dark: {
          theme: 'dark',
        },
      },
      // Pause les animations pour des screenshots stables
      pauseAnimationAtEnd: true,
      // Délai pour permettre le rendu complet
      delay: 300,
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 space-y-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Test: Tous les variants de Button
 */
export const AllButtons: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Button Variants - Normal</h3>
        <div className="flex gap-4 flex-wrap">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Button Sizes</h3>
        <div className="flex gap-4 items-center flex-wrap">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">👍</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Button States</h3>
        <div className="flex gap-4 flex-wrap">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
          <Button className="hover:scale-105">Hover</Button>
        </div>
      </div>
    </div>
  ),
};

/**
 * Test: Tous les variants de Badge
 */
export const AllBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Badge Variants</h3>
      <div className="flex gap-3 flex-wrap">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>
    </div>
  ),
};

/**
 * Test: Cards avec différents styles
 */
export const AllCards: Story = {
  render: () => (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-4">
        <h4 className="font-semibold text-foreground mb-2">Basic Card</h4>
        <p className="text-sm text-muted-foreground">
          A simple card with default styling using semantic tokens.
        </p>
      </Card>

      <Card className="p-4 border-primary/20 bg-primary/5">
        <h4 className="font-semibold text-foreground mb-2">Accent Card</h4>
        <p className="text-sm text-muted-foreground">
          Card with primary accent using opacity modifiers.
        </p>
      </Card>

      <Card className="p-4 border-success/20 bg-success/5">
        <Badge variant="outline" className="mb-2 border-success/20 text-success">Success</Badge>
        <h4 className="font-semibold text-foreground">Success Card</h4>
        <p className="text-sm text-muted-foreground">Using success semantic tokens.</p>
      </Card>

      <Card className="p-4 border-destructive/20 bg-destructive/5">
        <Badge variant="destructive" className="mb-2">Error</Badge>
        <h4 className="font-semibold text-foreground">Error Card</h4>
        <p className="text-sm text-muted-foreground">Using destructive semantic tokens.</p>
      </Card>
    </div>
  ),
};

/**
 * Test: Alerts avec tous les variants
 */
export const AllAlerts: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Info Alert</AlertTitle>
        <AlertDescription>
          This is an informational alert using default styling.
        </AlertDescription>
      </Alert>

      <Alert className="border-success/20 bg-success/5">
        <CheckCircle className="h-4 w-4 text-success" />
        <AlertTitle className="text-success">Success Alert</AlertTitle>
        <AlertDescription className="text-success/80">
          Operation completed successfully using success tokens.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Alert</AlertTitle>
        <AlertDescription>
          Something went wrong using destructive variant.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

/**
 * Test: Color Tokens Palette
 */
export const ColorTokensPalette: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="h-24 bg-primary text-primary-foreground rounded flex items-center justify-center font-semibold">
        Primary
      </div>
      <div className="h-24 bg-secondary text-secondary-foreground rounded flex items-center justify-center font-semibold">
        Secondary
      </div>
      <div className="h-24 bg-accent text-accent-foreground rounded flex items-center justify-center font-semibold">
        Accent
      </div>
      <div className="h-24 bg-success text-success-foreground rounded flex items-center justify-center font-semibold">
        Success
      </div>
      <div className="h-24 bg-warning text-warning-foreground rounded flex items-center justify-center font-semibold">
        Warning
      </div>
      <div className="h-24 bg-destructive text-destructive-foreground rounded flex items-center justify-center font-semibold">
        Destructive
      </div>
      <div className="h-24 bg-muted text-muted-foreground rounded flex items-center justify-center font-semibold">
        Muted
      </div>
      <div className="h-24 bg-card text-card-foreground rounded flex items-center justify-center font-semibold border border-border">
        Card
      </div>
      <div className="h-24 bg-background text-foreground rounded flex items-center justify-center font-semibold border border-border">
        Background
      </div>
    </div>
  ),
};

/**
 * Test: Gradients
 */
export const Gradients: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="h-32 bg-gradient-medical rounded flex items-center justify-center text-primary-foreground font-semibold">
        Medical Gradient
      </div>
      <div className="h-32 bg-gradient-header rounded flex items-center justify-center text-foreground font-semibold">
        Header Gradient
      </div>
      <div className="h-32 bg-gradient-card rounded flex items-center justify-center text-foreground font-semibold col-span-2">
        Card Gradient
      </div>
    </div>
  ),
};

/**
 * Test: Typography Scale
 */
export const TypographyScale: Story = {
  render: () => (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold text-foreground">Heading 1 - Bold</h1>
      <h2 className="text-3xl font-semibold text-foreground">Heading 2 - Semibold</h2>
      <h3 className="text-2xl font-semibold text-foreground">Heading 3 - Semibold</h3>
      <h4 className="text-xl font-medium text-foreground">Heading 4 - Medium</h4>
      <p className="text-base text-foreground">Body text - Regular weight</p>
      <p className="text-sm text-muted-foreground">Small text - Muted foreground</p>
      <p className="text-xs text-muted-foreground">Extra small text - Muted</p>
    </div>
  ),
};

/**
 * Test: Complex Layout
 */
export const ComplexLayout: Story = {
  render: () => (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Dashboard Overview</h3>
            <p className="text-sm text-muted-foreground">System metrics and status</p>
          </div>
          <Badge variant="outline" className="border-success/20 text-success">Active</Badge>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-1">CPU Usage</p>
            <p className="text-2xl font-bold text-foreground">45%</p>
          </div>
          <div className="p-4 rounded border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Memory</p>
            <p className="text-2xl font-bold text-foreground">2.4GB</p>
          </div>
          <div className="p-4 rounded border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Uptime</p>
            <p className="text-2xl font-bold text-foreground">99.9%</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm">Refresh</Button>
          <Button size="sm" variant="outline">Export</Button>
        </div>
      </Card>
    </div>
  ),
};
