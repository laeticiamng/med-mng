import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Components/Feedback/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Barres de progression pour indiquer l\'avancement. Animations fluides et mode clair/sombre.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Progress value={60} className="w-[400px]" />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Loading...</span>
        <span className="text-muted-foreground">60%</span>
      </div>
      <Progress value={60} />
    </div>
  ),
};

export const Animated: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 10;
        });
      }, 500);

      return () => clearInterval(timer);
    }, []);

    return (
      <div className="w-[400px] space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Progress</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Barre de progression animée automatiquement.',
      },
    },
  },
};

export const FileUpload: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const startUpload = () => {
      setIsUploading(true);
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsUploading(false);
            return 100;
          }
          return prev + 5;
        });
      }, 200);
    };

    return (
      <div className="w-[400px] space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">File Upload</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">document.pdf</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
            {progress === 100 && (
              <p className="text-sm text-success">Upload complete!</p>
            )}
          </div>
        </div>
        <Button onClick={startUpload} disabled={isUploading} className="w-full">
          {isUploading ? 'Uploading...' : 'Start Upload'}
        </Button>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulation d\'upload de fichier avec progression.',
      },
    },
  },
};

export const MultipleProgress: Story = {
  render: () => (
    <div className="w-[450px] space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Project Setup</span>
          <span className="text-success font-medium">Complete</span>
        </div>
        <Progress value={100} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Database Migration</span>
          <span className="text-muted-foreground">75%</span>
        </div>
        <Progress value={75} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Testing</span>
          <span className="text-muted-foreground">45%</span>
        </div>
        <Progress value={45} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Deployment</span>
          <span className="text-muted-foreground">0%</span>
        </div>
        <Progress value={0} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Plusieurs barres de progression pour différentes tâches.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Small (h-2)</p>
        <Progress value={60} className="h-2" />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Default (h-4)</p>
        <Progress value={60} />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Large (h-6)</p>
        <Progress value={60} className="h-6" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Différentes tailles de barres de progression.',
      },
    },
  },
};

export const StepProgress: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const progress = (currentStep / totalSteps) * 100;

    return (
      <div className="w-[500px] space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-4">Account Setup</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Step {currentStep} of {totalSteps}</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 text-xs text-center">
            <div className={currentStep >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'}>
              Personal
            </div>
            <div className={currentStep >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}>
              Contact
            </div>
            <div className={currentStep >= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}>
              Preferences
            </div>
            <div className={currentStep >= 4 ? 'text-primary font-medium' : 'text-muted-foreground'}>
              Review
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex-1"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              disabled={currentStep === totalSteps}
              className="flex-1"
            >
              {currentStep === totalSteps ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Progression par étapes pour formulaire multi-pages.',
      },
    },
  },
};

export const ColoredProgress: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div className="space-y-2">
        <p className="text-sm">Success</p>
        <Progress value={80} className="[&>div]:bg-success" />
      </div>
      <div className="space-y-2">
        <p className="text-sm">Warning</p>
        <Progress value={50} className="[&>div]:bg-warning" />
      </div>
      <div className="space-y-2">
        <p className="text-sm">Destructive</p>
        <Progress value={30} className="[&>div]:bg-destructive" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Barres de progression avec différentes couleurs.',
      },
    },
  },
};
