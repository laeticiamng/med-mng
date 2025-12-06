import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Cartes conteneurs flexibles avec header, content et footer. Support complet mode clair/sombre.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here with proper spacing and styling.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Card with Footer</CardTitle>
        <CardDescription>This card includes footer actions</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Main content area with information.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Confirm</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithBadges: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Status Card</CardTitle>
          <Badge variant="secondary">Active</Badge>
        </div>
        <CardDescription>Card with status badges</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm">This card demonstrates badge integration.</p>
          <div className="flex gap-2">
            <Badge variant="outline">Tag 1</Badge>
            <Badge variant="outline">Tag 2</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card className="w-96 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/20">
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>Hover to see the effect</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">This card has hover effects for interactive scenarios.</p>
      </CardContent>
    </Card>
  ),
};

export const Minimal: Story = {
  render: () => (
    <Card className="w-96">
      <CardContent className="p-6">
        <p>Minimal card with just content, no header or footer.</p>
      </CardContent>
    </Card>
  ),
};