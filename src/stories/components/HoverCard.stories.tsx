import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin } from 'lucide-react';

const meta = {
  title: 'Components/Advanced/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Cartes d\'aperçu au survol pour afficher des informations détaillées. Animations fluides.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@username</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">@username</h4>
          <p className="text-sm text-muted-foreground">
            Software developer passionate about creating great user experiences.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@johndoe</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
            JD
          </div>
          <div className="space-y-2 flex-1">
            <div>
              <h4 className="text-sm font-semibold">John Doe</h4>
              <p className="text-sm text-muted-foreground">@johndoe</p>
            </div>
            <p className="text-sm">
              Full-stack developer specializing in React and Node.js. 
              Building products that people love.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Joined March 2023</span>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold">1.2k</span>
                <span className="text-muted-foreground"> Followers</span>
              </div>
              <div>
                <span className="font-semibold">234</span>
                <span className="text-muted-foreground"> Following</span>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Carte de profil utilisateur détaillée.',
      },
    },
  },
};

export const ProductPreview: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">View Product</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div className="h-32 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Premium Product</h4>
            <p className="text-sm text-muted-foreground">
              High-quality product with excellent features and durability.
              Perfect for everyday use.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">$99.00</span>
              <span className="text-sm text-success">In Stock</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Aperçu de produit avec image et prix.',
      },
    },
  },
};

export const LocationInfo: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">
          <MapPin className="h-4 w-4 mr-1" />
          San Francisco, CA
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold">San Francisco</h4>
            <p className="text-sm text-muted-foreground">California, United States</p>
          </div>
          <p className="text-sm">
            Known for its iconic Golden Gate Bridge, cable cars, and vibrant tech
            industry. A major cultural and financial center.
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Population:</span>
              <p className="font-medium">873,965</p>
            </div>
            <div>
              <span className="text-muted-foreground">Timezone:</span>
              <p className="font-medium">PST (UTC-8)</p>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Informations de localisation détaillées.',
      },
    },
  },
};

export const LinkPreview: Story = {
  render: () => (
    <div className="max-w-md space-y-3 text-sm">
      <p>
        Check out this{' '}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="h-auto p-0 text-primary">
              amazing article
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <div className="h-24 rounded bg-gradient-to-br from-primary/20 to-accent/20" />
              <h4 className="font-semibold">How to Build Better Products</h4>
              <p className="text-sm text-muted-foreground">
                Learn the essential principles of product design and development
                from industry experts.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>example.com</span>
                <span>•</span>
                <span>5 min read</span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        {' '}about product design.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Aperçu de lien intégré dans le texte.',
      },
    },
  },
};

export const Positions: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline">Top</Button>
        </HoverCardTrigger>
        <HoverCardContent side="top">
          <p className="text-sm">Card positioned on top</p>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline">Right</Button>
        </HoverCardTrigger>
        <HoverCardContent side="right">
          <p className="text-sm">Card positioned on right</p>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </HoverCardTrigger>
        <HoverCardContent side="bottom">
          <p className="text-sm">Card positioned on bottom</p>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline">Left</Button>
        </HoverCardTrigger>
        <HoverCardContent side="left">
          <p className="text-sm">Card positioned on left</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Différentes positions de la hover card.',
      },
    },
  },
};
