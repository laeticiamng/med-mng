import React, { useState } from 'react';
import { Check, Copy, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ColorToken {
  name: string;
  cssVar: string;
  description: string;
  category: 'primary' | 'semantic' | 'status' | 'neutral';
}

const ColorPicker: React.FC = () => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorToken | null>(null);

  const colorTokens: ColorToken[] = [
    { name: 'Primary', cssVar: '--primary', description: 'Main brand color', category: 'primary' },
    { name: 'Primary Foreground', cssVar: '--primary-foreground', description: 'Text on primary', category: 'primary' },
    { name: 'Secondary', cssVar: '--secondary', description: 'Secondary UI', category: 'semantic' },
    { name: 'Secondary Foreground', cssVar: '--secondary-foreground', description: 'Text on secondary', category: 'semantic' },
    { name: 'Accent', cssVar: '--accent', description: 'Accent highlights', category: 'semantic' },
    { name: 'Accent Foreground', cssVar: '--accent-foreground', description: 'Text on accent', category: 'semantic' },
    { name: 'Success', cssVar: '--success', description: 'Success states', category: 'status' },
    { name: 'Warning', cssVar: '--warning', description: 'Warning states', category: 'status' },
    { name: 'Destructive', cssVar: '--destructive', description: 'Error states', category: 'status' },
    { name: 'Muted', cssVar: '--muted', description: 'Muted backgrounds', category: 'neutral' },
    { name: 'Card', cssVar: '--card', description: 'Card backgrounds', category: 'neutral' },
    { name: 'Background', cssVar: '--background', description: 'Page background', category: 'neutral' },
  ];

  const getComputedColor = (cssVar: string): { hsl: string; hex: string; rgb: string } => {
    const hslValue = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    const fullHsl = `hsl(${hslValue})`;
    
    // Create temporary element to get RGB
    const temp = document.createElement('div');
    temp.style.color = fullHsl;
    document.body.appendChild(temp);
    const rgb = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    
    // Convert RGB to HEX
    const rgbMatch = rgb.match(/\d+/g);
    const hex = rgbMatch 
      ? '#' + rgbMatch.map(x => parseInt(x).toString(16).padStart(2, '0')).join('').toUpperCase()
      : '#000000';
    
    return { hsl: hslValue, hex, rgb };
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(`${format}-${text}`);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const groupedTokens = colorTokens.reduce((acc, token) => {
    if (!acc[token.category]) acc[token.category] = [];
    acc[token.category].push(token);
    return acc;
  }, {} as Record<string, ColorToken[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Palette className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold text-foreground">Color Token Picker</h2>
          <p className="text-sm text-muted-foreground">Click any color to see HSL, HEX, and RGB values</p>
        </div>
      </div>

      {/* Selected Color Preview */}
      {selectedColor && (
        <Card className="p-6 animate-scale-in">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div 
                className="h-32 rounded-lg mb-4 border-2 border-border"
                style={{ backgroundColor: `hsl(var(${selectedColor.cssVar}))` }}
              />
              <h3 className="font-semibold text-foreground mb-1">{selectedColor.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedColor.description}</p>
              <Badge variant="outline" className="mt-2">{selectedColor.category}</Badge>
            </div>
            
            <div className="space-y-3">
              {['hsl', 'hex', 'rgb'].map((format) => {
                const colors = getComputedColor(selectedColor.cssVar);
                const value = format === 'hsl' ? colors.hsl : format === 'hex' ? colors.hex : colors.rgb;
                const displayValue = format === 'hsl' ? `hsl(${value})` : value;
                
                return (
                  <div key={format} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div>
                      <div className="text-xs uppercase text-muted-foreground font-medium mb-1">{format}</div>
                      <code className="text-sm text-foreground">{displayValue}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(displayValue, format)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedToken === `${format}-${displayValue}` ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
              
              <div className="pt-2">
                <div className="text-xs uppercase text-muted-foreground font-medium mb-2">CSS Variable</div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <code className="text-sm text-foreground">hsl(var({selectedColor.cssVar}))</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(`hsl(var(${selectedColor.cssVar}))`, 'css')}
                    className="h-8 w-8 p-0"
                  >
                    {copiedToken === `css-hsl(var(${selectedColor.cssVar}))` ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Color Grid by Category */}
      {Object.entries(groupedTokens).map(([category, tokens]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-foreground mb-3 capitalize">{category} Colors</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {tokens.map((token) => (
              <button
                key={token.cssVar}
                onClick={() => setSelectedColor(token)}
                className={cn(
                  "group relative overflow-hidden rounded-lg border-2 transition-all hover:scale-105",
                  selectedColor?.cssVar === token.cssVar 
                    ? "border-primary ring-2 ring-primary/20" 
                    : "border-border hover:border-primary/50"
                )}
                aria-label={`Select ${token.name}`}
              >
                <div 
                  className="h-20 transition-opacity group-hover:opacity-90"
                  style={{ backgroundColor: `hsl(var(${token.cssVar}))` }}
                />
                <div className="p-2 bg-card">
                  <div className="text-xs font-medium text-foreground truncate">{token.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{token.cssVar}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ColorPicker;
