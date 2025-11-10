import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'Components/Forms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Cases à cocher pour sélections multiples. Support états cochés/indéterminés et mode clair/sombre.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'État coché',
    },
    disabled: {
      control: 'boolean',
      description: 'État désactivé',
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Checkbox />,
};

export const Checked: Story = {
  render: () => <Checkbox checked />,
};

export const Disabled: Story = {
  render: () => <Checkbox disabled />,
};

export const DisabledChecked: Story = {
  render: () => <Checkbox disabled checked />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Checkbox avec label associé.',
      },
    },
  },
};

export const MultipleOptions: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="flex items-center space-x-2">
        <Checkbox id="option1" defaultChecked />
        <Label htmlFor="option1">Email notifications</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option2" />
        <Label htmlFor="option2">SMS notifications</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option3" defaultChecked />
        <Label htmlFor="option3">Push notifications</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option4" disabled />
        <Label htmlFor="option4" className="text-muted-foreground">
          In-app notifications (coming soon)
        </Label>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Liste de checkboxes pour sélections multiples.',
      },
    },
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Marketing Communications</p>
            <div className="space-y-2 ml-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="marketing-email" />
                <Label htmlFor="marketing-email">Email newsletters</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="marketing-sms" />
                <Label htmlFor="marketing-sms">SMS promotions</Label>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Account Updates</p>
            <div className="space-y-2 ml-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="account-security" defaultChecked />
                <Label htmlFor="account-security">Security alerts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="account-billing" defaultChecked />
                <Label htmlFor="account-billing">Billing updates</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Exemple de formulaire avec groupes de checkboxes.',
      },
    },
  },
};

export const WithDescription: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="analytics" />
          <Label htmlFor="analytics">Enable analytics</Label>
        </div>
        <p className="text-sm text-muted-foreground ml-6">
          Help us improve by sharing anonymous usage data
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="crash-reports" defaultChecked />
          <Label htmlFor="crash-reports">Send crash reports</Label>
        </div>
        <p className="text-sm text-muted-foreground ml-6">
          Automatically send error reports to help us fix bugs
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Checkboxes avec descriptions contextuelles.',
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="unchecked" />
        <Label htmlFor="unchecked">Unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="checked" checked />
        <Label htmlFor="checked">Checked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-unchecked" disabled />
        <Label htmlFor="disabled-unchecked">Disabled Unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled checked />
        <Label htmlFor="disabled-checked">Disabled Checked</Label>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tous les états possibles de la checkbox.',
      },
    },
  },
};
