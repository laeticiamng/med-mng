import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const meta = {
  title: 'UI/Layout/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Maintient un ratio d\'aspect constant pour les images et vidéos. Essentiel pour des layouts responsives cohérents.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ratio: {
      control: 'number',
      description: 'Ratio largeur/hauteur (ex: 16/9 = 1.777)',
    },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SixteenByNine: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: (args) => (
    <div className="w-full max-w-2xl">
      <AspectRatio {...args}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-primary/5 border">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold">Ratio 16:9</p>
            <p className="text-xs text-muted-foreground">Format vidéo widescreen</p>
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  args: {
    ratio: 1,
  },
  render: (args) => (
    <div className="w-full max-w-md">
      <AspectRatio {...args}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br from-secondary/20 to-secondary/5 border">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold">Ratio 1:1</p>
            <p className="text-xs text-muted-foreground">Format carré</p>
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const FourByThree: Story = {
  args: {
    ratio: 4 / 3,
  },
  render: (args) => (
    <div className="w-full max-w-xl">
      <AspectRatio {...args}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br from-accent/20 to-accent/5 border">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold">Ratio 4:3</p>
            <p className="text-xs text-muted-foreground">Format classique</p>
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Portrait: Story = {
  args: {
    ratio: 3 / 4,
  },
  render: (args) => (
    <div className="w-full max-w-sm">
      <AspectRatio {...args}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br from-muted to-muted/50 border">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold">Ratio 3:4</p>
            <p className="text-xs text-muted-foreground">Format portrait</p>
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const WithImage: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: (args) => (
    <div className="w-full max-w-2xl">
      <AspectRatio {...args} className="bg-muted rounded-md overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Photo nature"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  ),
};

export const ImageGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 max-w-3xl">
      {Array.from({ length: 6 }).map((_, i) => (
        <AspectRatio key={i} ratio={1} className="bg-muted rounded-md overflow-hidden">
          <img
            src={`https://images.unsplash.com/photo-${1588345921523 + i}-c2dcdb7f1dcd?w=400&dpr=2&q=80`}
            alt={`Image ${i + 1}`}
            className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
          />
        </AspectRatio>
      ))}
    </div>
  ),
};

export const VideoPlaceholder: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: (args) => (
    <div className="w-full max-w-3xl">
      <AspectRatio {...args} className="bg-muted rounded-lg overflow-hidden border">
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">Lecteur vidéo</p>
            <p className="text-xs text-muted-foreground">Ratio 16:9 maintenu</p>
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <div className="w-full max-w-sm rounded-lg border bg-card overflow-hidden">
      <AspectRatio ratio={4 / 3} className="bg-muted">
        <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <span className="text-4xl">📦</span>
        </div>
      </AspectRatio>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold">Nom du produit</h3>
        <p className="text-sm text-muted-foreground">
          Description courte du produit avec ses caractéristiques principales.
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold">29,99 €</span>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
            Ajouter
          </button>
        </div>
      </div>
    </div>
  ),
};

export const ResponsiveGallery: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-md overflow-hidden border bg-card">
          <AspectRatio ratio={1}>
            <div className="h-full w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                {i + 1}
              </span>
            </div>
          </AspectRatio>
          <div className="p-2">
            <p className="text-xs font-medium">Item {i + 1}</p>
          </div>
        </div>
      ))}
    </div>
  ),
};
