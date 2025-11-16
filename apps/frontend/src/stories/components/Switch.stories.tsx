import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'Components/Forms/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Interrupteurs pour activer/désactiver des options. Support états et mode clair/sombre avec animations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'État activé',
    },
    disabled: {
      control: 'boolean',
      description: 'État désactivé',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Switch />,
};

export const Checked: Story = {
  render: () => <Switch checked />,
};

export const Disabled: Story = {
  render: () => <Switch disabled />,
};

export const DisabledChecked: Story = {
  render: () => <Switch disabled checked />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Switch avec label associé.',
      },
    },
  },
};

export const SettingsExample: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <h3 className="text-lg font-semibold">Notification Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about your account activity
            </p>
          </div>
          <Switch id="email-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications on your devices
            </p>
          </div>
          <Switch id="push-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sms-notifications">SMS Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive text messages for important updates
            </p>
          </div>
          <Switch id="sms-notifications" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Exemple de paramètres avec switches et descriptions.',
      },
    },
  },
};

export const PrivacySettings: Story = {
  render: () => (
    <div className="w-[450px] space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Privacy Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your privacy and data preferences
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="profile-visibility" className="font-medium">
              Public Profile
            </Label>
            <p className="text-sm text-muted-foreground">
              Make your profile visible to everyone
            </p>
          </div>
          <Switch id="profile-visibility" defaultChecked />
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="activity-status" className="font-medium">
              Activity Status
            </Label>
            <p className="text-sm text-muted-foreground">
              Show when you're online
            </p>
          </div>
          <Switch id="activity-status" defaultChecked />
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="data-sharing" className="font-medium">
              Data Sharing
            </Label>
            <p className="text-sm text-muted-foreground">
              Share anonymous usage data
            </p>
          </div>
          <Switch id="data-sharing" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Paramètres de confidentialité avec cartes.',
      },
    },
  },
};

export const CompactList: Story = {
  render: () => (
    <div className="w-[350px] space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="wifi">Wi-Fi</Label>
        <Switch id="wifi" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="bluetooth">Bluetooth</Label>
        <Switch id="bluetooth" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="cellular">Cellular Data</Label>
        <Switch id="cellular" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="location">Location Services</Label>
        <Switch id="location" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="nfc" className="text-muted-foreground">NFC</Label>
        <Switch id="nfc" disabled />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Liste compacte de switches pour paramètres rapides.',
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="unchecked" />
        <Label htmlFor="unchecked">Unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="checked" checked />
        <Label htmlFor="checked">Checked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="disabled-unchecked" disabled />
        <Label htmlFor="disabled-unchecked">Disabled Unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="disabled-checked" disabled checked />
        <Label htmlFor="disabled-checked">Disabled Checked</Label>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tous les états possibles du switch.',
      },
    },
  },
};

export const FeatureToggles: Story = {
  render: () => (
    <div className="w-[450px] space-y-4">
      <h3 className="text-lg font-semibold">Feature Toggles</h3>
      <div className="space-y-3 border rounded-lg p-4">
        <div className="flex items-center justify-between pb-3 border-b">
          <div>
            <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
            <p className="text-xs text-muted-foreground">Enable dark theme</p>
          </div>
          <Switch id="dark-mode" />
        </div>
        <div className="flex items-center justify-between pb-3 border-b">
          <div>
            <Label htmlFor="compact-view" className="font-medium">Compact View</Label>
            <p className="text-xs text-muted-foreground">Reduce spacing</p>
          </div>
          <Switch id="compact-view" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-save" className="font-medium">Auto-save</Label>
            <p className="text-xs text-muted-foreground">Save changes automatically</p>
          </div>
          <Switch id="auto-save" defaultChecked />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toggles de fonctionnalités avec bordures et séparateurs.',
      },
    },
  },
};
