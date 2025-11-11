import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Eye, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TokenInfo {
  property: string;
  value: string;
  computed: string;
  category: 'color' | 'spacing' | 'typography' | 'other';
}

const DesignSystemDevTools: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [copiedProperty, setCopiedProperty] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Extract CSS custom properties (design tokens)
  const extractTokens = useCallback((element: HTMLElement): TokenInfo[] => {
    const computedStyle = window.getComputedStyle(element);
    const tokens: TokenInfo[] = [];

    // Get all CSS variables from :root
    const rootStyles = window.getComputedStyle(document.documentElement);
    
    // Color tokens
    const colorProps = ['color', 'background-color', 'border-color', 'fill', 'stroke'];
    colorProps.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
        // Check if it matches a design token
        const tokenName = findMatchingToken(value, rootStyles, 'color');
        tokens.push({
          property: prop,
          value: tokenName || value,
          computed: value,
          category: 'color'
        });
      }
    });

    // Spacing tokens
    const spacingProps = ['padding', 'margin', 'gap', 'width', 'height'];
    spacingProps.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== '0px' && value !== 'auto') {
        tokens.push({
          property: prop,
          value: value,
          computed: value,
          category: 'spacing'
        });
      }
    });

    // Typography tokens
    const typographyProps = ['font-size', 'font-weight', 'line-height', 'font-family'];
    typographyProps.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value) {
        tokens.push({
          property: prop,
          value: value,
          computed: value,
          category: 'typography'
        });
      }
    });

    // Border radius
    const borderRadius = computedStyle.getPropertyValue('border-radius');
    if (borderRadius && borderRadius !== '0px') {
      tokens.push({
        property: 'border-radius',
        value: borderRadius,
        computed: borderRadius,
        category: 'other'
      });
    }

    return tokens;
  }, []);

  // Find matching CSS variable for a computed value
  const findMatchingToken = (computedValue: string, rootStyles: CSSStyleDeclaration, type: string): string | null => {
    const allVars: string[] = [];
    
    // Get all CSS variable names
    for (let i = 0; i < rootStyles.length; i++) {
      const prop = rootStyles[i];
      if (prop.startsWith('--')) {
        allVars.push(prop);
      }
    }

    // Try to find a matching token
    for (const varName of allVars) {
      const varValue = rootStyles.getPropertyValue(varName).trim();
      
      if (type === 'color') {
        // For HSL colors, check if they match
        if (computedValue.includes('hsl') && varValue.includes('hsl')) {
          if (normalizeHSL(computedValue) === normalizeHSL(varValue)) {
            return `var(${varName})`;
          }
        }
      }
    }

    return null;
  };

  // Normalize HSL values for comparison
  const normalizeHSL = (hsl: string): string => {
    return hsl.replace(/\s+/g, '').toLowerCase();
  };

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isVisible) return;

    const target = e.target as HTMLElement;
    if (overlayRef.current?.contains(target)) return;

    setHoveredElement(target);
    setPosition({ x: e.clientX, y: e.clientY });

    const extractedTokens = extractTokens(target);
    setTokens(extractedTokens);
  }, [isVisible, extractTokens]);

  // Toggle visibility with Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add/remove mouse move listener
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'crosshair';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = '';
      setHoveredElement(null);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = '';
    };
  }, [isVisible, handleMouseMove]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedProperty(text);
    setTimeout(() => setCopiedProperty(null), 2000);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Highlight overlay on hovered element */}
      {hoveredElement && (
        <div
          style={{
            position: 'fixed',
            top: hoveredElement.getBoundingClientRect().top + 'px',
            left: hoveredElement.getBoundingClientRect().left + 'px',
            width: hoveredElement.getBoundingClientRect().width + 'px',
            height: hoveredElement.getBoundingClientRect().height + 'px',
            border: '2px solid hsl(var(--primary))',
            backgroundColor: 'hsl(var(--primary) / 0.1)',
            pointerEvents: 'none',
            zIndex: 9998,
            transition: 'all 0.1s ease'
          }}
        />
      )}

      {/* DevTools Panel */}
      <div
        ref={overlayRef}
        className={cn(
          "fixed bg-card border-2 border-primary rounded-lg shadow-large",
          "max-w-md max-h-96 overflow-auto z-[9999]",
          "animate-scale-in"
        )}
        style={{
          left: Math.min(position.x + 20, window.innerWidth - 400) + 'px',
          top: Math.min(position.y + 20, window.innerHeight - 400) + 'px'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-medical p-3 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-semibold text-primary-foreground">
              Design System Inspector
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Element Info */}
        {hoveredElement && (
          <div className="p-3 border-b border-border bg-muted/30">
            <div className="text-xs font-mono text-muted-foreground">
              &lt;{hoveredElement.tagName.toLowerCase()}
              {hoveredElement.className && (
                <span className="text-primary"> className="{hoveredElement.className.split(' ').slice(0, 2).join(' ')}..."</span>
              )}
              &gt;
            </div>
          </div>
        )}

        {/* Tokens List */}
        <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
          {tokens.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Hover over an element to inspect its tokens
            </p>
          ) : (
            <>
              {/* Group by category */}
              {['color', 'spacing', 'typography', 'other'].map(category => {
                const categoryTokens = tokens.filter(t => t.category === category);
                if (categoryTokens.length === 0) return null;

                return (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {categoryTokens.map((token, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-2 p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-foreground truncate">
                              {token.property}
                            </div>
                            <div className="text-xs font-mono text-muted-foreground truncate">
                              {token.value}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(token.value)}
                            className="h-6 w-6 p-0 flex-shrink-0"
                            title="Copy value"
                          >
                            {copiedProperty === token.value ? (
                              <Check className="h-3 w-3 text-success" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-2 bg-muted/30 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1 py-0.5 bg-background border border-border rounded text-[10px]">Ctrl+Shift+D</kbd> to close
          </p>
        </div>
      </div>
    </>
  );
};

export default DesignSystemDevTools;
