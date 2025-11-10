import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Components/Forms/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Zones de texte multi-lignes pour saisie longue. Support états et mode clair/sombre.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'État désactivé',
    },
    placeholder: {
      control: 'text',
      description: 'Texte du placeholder',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Textarea placeholder="Type your message here..." className="w-[400px]" />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="message">Your Message</Label>
      <Textarea id="message" placeholder="Type your message here..." />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Textarea
      placeholder="This field is disabled"
      disabled
      value="Cannot edit this text"
      className="w-[400px]"
    />
  ),
};

export const WithCharacterCount: Story = {
  render: () => {
    const maxLength = 200;
    return (
      <div className="w-[400px] space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself..."
          maxLength={maxLength}
        />
        <p className="text-xs text-muted-foreground text-right">
          0 / {maxLength} characters
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Textarea avec compteur de caractères.',
      },
    },
  },
};

export const ContactForm: Story = {
  render: () => (
    <div className="w-[500px] space-y-6 p-6 border rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-1">Contact Us</h3>
        <p className="text-sm text-muted-foreground">
          Send us a message and we'll get back to you
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <input
            id="name"
            placeholder="John Doe"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <input
            id="email"
            type="email"
            placeholder="john@example.com"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Your message..."
            rows={5}
          />
        </div>
        <Button className="w-full">Send Message</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Exemple de formulaire de contact complet.',
      },
    },
  },
};

export const FeedbackForm: Story = {
  render: () => (
    <div className="w-[450px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="feedback">Share Your Feedback</Label>
        <p className="text-sm text-muted-foreground">
          Help us improve by sharing your thoughts
        </p>
        <Textarea
          id="feedback"
          placeholder="What did you like? What could be better?"
          rows={6}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1">Cancel</Button>
        <Button className="flex-1">Submit Feedback</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Formulaire de feedback avec description et actions.',
      },
    },
  },
};

export const CustomHeight: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div className="space-y-2">
        <Label>Short (3 rows)</Label>
        <Textarea placeholder="Short textarea..." rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Medium (5 rows - default)</Label>
        <Textarea placeholder="Medium textarea..." />
      </div>
      <div className="space-y-2">
        <Label>Tall (10 rows)</Label>
        <Textarea placeholder="Tall textarea..." rows={10} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Différentes hauteurs de textarea.',
      },
    },
  },
};

export const WithHelperText: Story = {
  render: () => (
    <div className="w-[450px] space-y-2">
      <Label htmlFor="description">Project Description</Label>
      <Textarea
        id="description"
        placeholder="Describe your project in detail..."
        rows={6}
      />
      <p className="text-sm text-muted-foreground">
        Include key features, goals, and timeline. Min. 50 characters.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Textarea avec texte d\'aide en dessous.',
      },
    },
  },
};

export const ErrorState: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="error-field" className="text-destructive">
        Required Field
      </Label>
      <Textarea
        id="error-field"
        placeholder="This field is required..."
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-sm text-destructive">
        This field is required and cannot be empty
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Textarea avec état d\'erreur.',
      },
    },
  },
};

export const ReadOnly: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="readonly">Terms and Conditions</Label>
      <Textarea
        id="readonly"
        readOnly
        value="By using this service, you agree to our terms and conditions. This is a read-only field that displays important legal information that cannot be modified."
        rows={4}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Textarea en lecture seule.',
      },
    },
  },
};

export const CommentSection: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Add a Comment</h3>
        <div className="space-y-3">
          <Textarea
            placeholder="Share your thoughts..."
            rows={4}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Be respectful and constructive
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button size="sm">Post Comment</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Section de commentaires avec textarea et actions.',
      },
    },
  },
};
