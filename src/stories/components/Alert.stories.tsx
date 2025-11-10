import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Alertes pour afficher des messages importants à l\'utilisateur. Support complet mode clair/sombre.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'Style de l\'alerte',
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert className="max-w-xl">
      <Info className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This is a default alert with informational content.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="max-w-xl">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Something went wrong. Please try again later.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert className="max-w-xl border-success bg-success/10">
      <CheckCircle2 className="h-4 w-4 text-success" />
      <AlertTitle className="text-success">Success</AlertTitle>
      <AlertDescription className="text-success/90">
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alerte de succès utilisant les tokens de couleur success.',
      },
    },
  },
};

export const Warning: Story = {
  render: () => (
    <Alert className="max-w-xl border-warning bg-warning/10">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertTitle className="text-warning">Warning</AlertTitle>
      <AlertDescription className="text-warning/90">
        Please review your information before proceeding.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alerte d\'avertissement utilisant les tokens de couleur warning.',
      },
    },
  },
};

export const NoTitle: Story = {
  render: () => (
    <Alert className="max-w-xl">
      <Info className="h-4 w-4" />
      <AlertDescription>
        Simple alert without title, just description.
      </AlertDescription>
    </Alert>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 max-w-xl">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Default informational alert with icon and title.
        </AlertDescription>
      </Alert>

      <Alert className="border-success bg-success/10">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <AlertTitle className="text-success">Success</AlertTitle>
        <AlertDescription className="text-success/90">
          Operation completed successfully.
        </AlertDescription>
      </Alert>

      <Alert className="border-warning bg-warning/10">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertTitle className="text-warning">Warning</AlertTitle>
        <AlertDescription className="text-warning/90">
          Please proceed with caution.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          An error occurred during the operation.
        </AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tous les types d\'alertes disponibles.',
      },
    },
  },
};
