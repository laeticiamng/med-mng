import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const ToastDemo = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-2">
      <Button
        onClick={() => {
          toast({
            title: "Success!",
            description: "Your changes have been saved.",
          });
        }}
      >
        Show Toast
      </Button>
      <Toaster />
    </div>
  );
};

const meta = {
  title: 'Components/Feedback/Toast',
  component: ToastDemo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Notifications toast pour feedback utilisateur. Animations d\'entrée/sortie fluides.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <>
        <Button
          onClick={() => {
            toast({
              title: "Notification",
              description: "This is a default toast message.",
            });
          }}
        >
          Show Toast
        </Button>
        <Toaster />
      </>
    );
  },
};

export const Success: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <>
        <Button
          onClick={() => {
            toast({
              title: "Success!",
              description: "Your changes have been saved successfully.",
              className: "border-success bg-success/10",
            });
          }}
        >
          Success Toast
        </Button>
        <Toaster />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast de succès.',
      },
    },
  },
};

export const Error: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <>
        <Button
          variant="destructive"
          onClick={() => {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Something went wrong. Please try again.",
            });
          }}
        >
          Error Toast
        </Button>
        <Toaster />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast d\'erreur avec variant destructive.',
      },
    },
  },
};

export const Warning: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <>
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Warning",
              description: "Please review your information before continuing.",
              className: "border-warning bg-warning/10",
            });
          }}
        >
          Warning Toast
        </Button>
        <Toaster />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast d\'avertissement.',
      },
    },
  },
};

export const WithAction: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <>
        <Button
          onClick={() => {
            toast({
              title: "Update Available",
              description: "A new version is available. Update now?",
              action: (
                <Button size="sm" variant="outline">
                  Update
                </Button>
              ),
            });
          }}
        >
          Toast with Action
        </Button>
        <Toaster />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast avec bouton d\'action.',
      },
    },
  },
};

export const WithIcon: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Information",
              description: "Here's some helpful information.",
            });
          }}
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Success",
              description: "Operation completed successfully!",
              className: "border-success bg-success/10",
            });
          }}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Warning",
              description: "Please proceed with caution.",
              className: "border-warning bg-warning/10",
            });
          }}
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast({
              variant: "destructive",
              title: "Error",
              description: "An error occurred.",
            });
          }}
        >
          Error
        </Button>
        <Toaster />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Toasts avec différents types de messages.',
      },
    },
  },
};

export const TitleOnly: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <>
        <Button
          onClick={() => {
            toast({
              title: "Message sent",
            });
          }}
        >
          Simple Toast
        </Button>
        <Toaster />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast simple avec titre uniquement.',
      },
    },
  },
};

export const LongContent: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <>
        <Button
          onClick={() => {
            toast({
              title: "Detailed Information",
              description:
                "This is a longer toast message that contains more detailed information about what just happened. It can span multiple lines to provide comprehensive feedback to the user.",
            });
          }}
        >
          Long Toast
        </Button>
        <Toaster />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Toast avec contenu long sur plusieurs lignes.',
      },
    },
  },
};

export const Multiple: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <>
        <Button
          onClick={() => {
            toast({ title: "First notification", description: "This is the first message." });
            setTimeout(() => {
              toast({ title: "Second notification", description: "This is the second message." });
            }, 500);
            setTimeout(() => {
              toast({ title: "Third notification", description: "This is the third message." });
            }, 1000);
          }}
        >
          Show Multiple
        </Button>
        <Toaster />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Plusieurs toasts affichés en séquence.',
      },
    },
  },
};
