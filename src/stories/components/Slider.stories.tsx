import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const meta = {
  title: 'Components/Forms/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Curseurs pour sélectionner des valeurs numériques. Support range et mode clair/sombre.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Slider defaultValue={[50]} max={100} step={1} className="w-[300px]" />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px] space-y-3">
      <Label>Volume</Label>
      <Slider defaultValue={[33]} max={100} step={1} />
    </div>
  ),
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState([50]);
    return (
      <div className="w-[300px] space-y-3">
        <div className="flex items-center justify-between">
          <Label>Volume</Label>
          <span className="text-sm text-muted-foreground">{value[0]}%</span>
        </div>
        <Slider value={value} onValueChange={setValue} max={100} step={1} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Slider avec affichage de la valeur courante.',
      },
    },
  },
};

export const CustomRange: Story = {
  render: () => {
    const [value, setValue] = useState([20]);
    return (
      <div className="w-[350px] space-y-3">
        <div className="flex items-center justify-between">
          <Label>Temperature (°C)</Label>
          <span className="text-sm font-medium">{value[0]}°C</span>
        </div>
        <Slider value={value} onValueChange={setValue} min={-10} max={40} step={1} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>-10°C</span>
          <span>40°C</span>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Slider avec range personnalisé et labels min/max.',
      },
    },
  },
};

export const PriceRange: Story = {
  render: () => {
    const [value, setValue] = useState([25, 75]);
    return (
      <div className="w-[400px] space-y-3">
        <div className="flex items-center justify-between">
          <Label>Price Range</Label>
          <span className="text-sm font-medium">
            ${value[0]} - ${value[1]}
          </span>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          min={0}
          max={100}
          step={5}
          minStepsBetweenThumbs={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$0</span>
          <span>$100</span>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Double slider pour sélectionner une plage de prix.',
      },
    },
  },
};

export const SettingsPanel: Story = {
  render: () => {
    const [volume, setVolume] = useState([65]);
    const [brightness, setBrightness] = useState([80]);
    const [contrast, setContrast] = useState([50]);
    
    return (
      <div className="w-[400px] space-y-6 p-6 border rounded-lg">
        <h3 className="text-lg font-semibold">Audio & Display</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Volume</Label>
            <span className="text-sm text-muted-foreground">{volume[0]}%</span>
          </div>
          <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Brightness</Label>
            <span className="text-sm text-muted-foreground">{brightness[0]}%</span>
          </div>
          <Slider value={brightness} onValueChange={setBrightness} max={100} step={1} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Contrast</Label>
            <span className="text-sm text-muted-foreground">{contrast[0]}%</span>
          </div>
          <Slider value={contrast} onValueChange={setContrast} max={100} step={1} />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Panneau de paramètres avec plusieurs sliders.',
      },
    },
  },
};

export const WithSteps: Story = {
  render: () => {
    const [value, setValue] = useState([2]);
    const labels = ['XS', 'S', 'M', 'L', 'XL'];
    
    return (
      <div className="w-[350px] space-y-3">
        <div className="flex items-center justify-between">
          <Label>Size</Label>
          <span className="text-sm font-medium">{labels[value[0]]}</span>
        </div>
        <Slider value={value} onValueChange={setValue} min={0} max={4} step={1} />
        <div className="flex justify-between text-xs text-muted-foreground">
          {labels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Slider avec étapes discrètes et labels personnalisés.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[300px] space-y-3">
      <Label className="text-muted-foreground">Disabled Slider</Label>
      <Slider defaultValue={[50]} max={100} step={1} disabled />
    </div>
  ),
};

export const FormExample: Story = {
  render: () => {
    const [budget, setBudget] = useState([5000]);
    const [duration, setDuration] = useState([6]);
    const [team, setTeam] = useState([5]);

    return (
      <div className="w-[450px] space-y-6 p-6 border rounded-lg">
        <div>
          <h3 className="text-lg font-semibold mb-1">Project Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Set your project parameters
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Budget</Label>
            <span className="text-sm font-medium">${budget[0].toLocaleString()}</span>
          </div>
          <Slider
            value={budget}
            onValueChange={setBudget}
            min={1000}
            max={50000}
            step={1000}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$1,000</span>
            <span>$50,000</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Duration</Label>
            <span className="text-sm font-medium">{duration[0]} months</span>
          </div>
          <Slider value={duration} onValueChange={setDuration} min={1} max={12} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 month</span>
            <span>12 months</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Team Size</Label>
            <span className="text-sm font-medium">{team[0]} people</span>
          </div>
          <Slider value={team} onValueChange={setTeam} min={1} max={20} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 person</span>
            <span>20 people</span>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Formulaire complet avec plusieurs sliders configurés.',
      },
    },
  },
};
