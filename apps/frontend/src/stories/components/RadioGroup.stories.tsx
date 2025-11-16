import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'Components/Forms/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Groupes de boutons radio pour sélection unique. Support états et mode clair/sombre.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <Label htmlFor="option3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <RadioGroup defaultValue="email">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="email" id="email" />
        <Label htmlFor="email">Email</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="sms" id="sms" />
        <Label htmlFor="sms">SMS</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="push" id="push" disabled />
        <Label htmlFor="push" className="text-muted-foreground">
          Push (Coming soon)
        </Label>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Radio group avec option désactivée.',
      },
    },
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Delivery Method</h3>
        <RadioGroup defaultValue="standard">
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="standard" id="standard" className="mt-0.5" />
              <div className="space-y-1">
                <Label htmlFor="standard" className="font-medium">
                  Standard Delivery
                </Label>
                <p className="text-sm text-muted-foreground">
                  3-5 business days • Free
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="express" id="express" className="mt-0.5" />
              <div className="space-y-1">
                <Label htmlFor="express" className="font-medium">
                  Express Delivery
                </Label>
                <p className="text-sm text-muted-foreground">
                  1-2 business days • $9.99
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="overnight" id="overnight" className="mt-0.5" />
              <div className="space-y-1">
                <Label htmlFor="overnight" className="font-medium">
                  Overnight Delivery
                </Label>
                <p className="text-sm text-muted-foreground">
                  Next business day • $19.99
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Exemple de formulaire avec descriptions détaillées.',
      },
    },
  },
};

export const PaymentMethod: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <h3 className="text-lg font-semibold">Payment Method</h3>
      <RadioGroup defaultValue="card">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex-1 cursor-pointer">
              Credit Card
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="flex-1 cursor-pointer">
              PayPal
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="bank" id="bank" />
            <Label htmlFor="bank" className="flex-1 cursor-pointer">
              Bank Transfer
            </Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Options de paiement avec cartes interactives.',
      },
    },
  },
};

export const HorizontalLayout: Story = {
  render: () => (
    <div className="space-y-4">
      <Label>Select Size</Label>
      <RadioGroup defaultValue="m" className="flex gap-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="s" id="size-s" />
          <Label htmlFor="size-s">Small</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="m" id="size-m" />
          <Label htmlFor="size-m">Medium</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="l" id="size-l" />
          <Label htmlFor="size-l">Large</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="xl" id="size-xl" />
          <Label htmlFor="size-xl">X-Large</Label>
        </div>
      </RadioGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disposition horizontale pour options courtes.',
      },
    },
  },
};

export const MultipleGroups: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div>
        <Label className="text-base font-semibold mb-3 block">Subscription Plan</Label>
        <RadioGroup defaultValue="pro">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="free" id="plan-free" />
            <Label htmlFor="plan-free">Free - $0/month</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pro" id="plan-pro" />
            <Label htmlFor="plan-pro">Pro - $29/month</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="enterprise" id="plan-enterprise" />
            <Label htmlFor="plan-enterprise">Enterprise - Custom</Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label className="text-base font-semibold mb-3 block">Billing Cycle</Label>
        <RadioGroup defaultValue="monthly">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="monthly" id="monthly" />
            <Label htmlFor="monthly">Monthly</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yearly" id="yearly" />
            <Label htmlFor="yearly">Yearly (Save 20%)</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Plusieurs groupes radio indépendants dans un même formulaire.',
      },
    },
  },
};
