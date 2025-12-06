/**
 * ESLint custom rule: no-hardcoded-colors
 * Detects hardcoded Tailwind color classes and suggests semantic tokens
 */

const HARDCODED_COLOR_PATTERNS = [
  // Direct color classes like text-white, bg-blue-500, etc.
  /\b(text|bg|border|from|to|via|ring|outline|divide|decoration|accent|caret|fill|stroke|shadow)-(white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-[0-9]{2,3})?\b/,
  
  // Dark mode variants like dark:bg-blue-500
  /dark:(text|bg|border|from|to|via|ring|outline)-(white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-[0-9]{2,3})?\b/
];

const SEMANTIC_SUGGESTIONS = {
  // Background colors
  'bg-white': 'bg-background',
  'bg-black': 'bg-foreground',
  'bg-gray-50': 'bg-muted',
  'bg-gray-100': 'bg-muted',
  'bg-slate-100': 'bg-muted',
  'bg-blue-50': 'bg-primary/10',
  'bg-blue-100': 'bg-primary/20',
  'bg-green-50': 'bg-success/10',
  'bg-green-100': 'bg-success/20',
  'bg-red-50': 'bg-destructive/10',
  'bg-red-100': 'bg-destructive/20',
  'bg-yellow-50': 'bg-warning/10',
  'bg-amber-50': 'bg-warning/10',
  'bg-orange-50': 'bg-warning/10',
  'bg-purple-50': 'bg-accent/10',
  
  // Text colors
  'text-white': 'text-foreground or text-primary-foreground',
  'text-black': 'text-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-slate-600': 'text-muted-foreground',
  'text-blue-600': 'text-primary',
  'text-green-600': 'text-success',
  'text-red-600': 'text-destructive',
  'text-yellow-600': 'text-warning',
  'text-amber-600': 'text-warning',
  'text-orange-600': 'text-warning',
  
  // Border colors
  'border-gray-200': 'border-border',
  'border-blue-200': 'border-primary/20',
  'border-green-200': 'border-success/20',
  'border-red-200': 'border-destructive/20',
  'border-yellow-200': 'border-warning/20',
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded Tailwind color classes, enforce semantic design tokens',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      hardcodedColor: 'Avoid hardcoded color "{{color}}". Use semantic token: {{suggestion}}',
      hardcodedColorGeneric: 'Avoid hardcoded color "{{color}}". Use semantic tokens from design system (--primary, --success, --destructive, --warning, --accent, --muted, etc.)',
    },
  },

  create(context) {
    return {
      JSXAttribute(node) {
        // Only check className attributes
        if (node.name.name !== 'className') {
          return;
        }

        let classValue = '';

        // Handle different types of className values
        if (node.value && node.value.type === 'Literal') {
          classValue = node.value.value;
        } else if (node.value && node.value.type === 'JSXExpressionContainer') {
          // Handle template literals and string concatenations
          const expr = node.value.expression;
          if (expr.type === 'TemplateLiteral') {
            classValue = expr.quasis.map(q => q.value.raw).join('');
          } else if (expr.type === 'Literal') {
            classValue = expr.value;
          }
        }

        if (typeof classValue !== 'string') {
          return;
        }

        // Check each class in the className string
        const classes = classValue.split(/\s+/);
        
        classes.forEach(cls => {
          HARDCODED_COLOR_PATTERNS.forEach(pattern => {
            if (pattern.test(cls)) {
              const suggestion = SEMANTIC_SUGGESTIONS[cls];
              
              context.report({
                node,
                messageId: suggestion ? 'hardcodedColor' : 'hardcodedColorGeneric',
                data: {
                  color: cls,
                  suggestion: suggestion || 'semantic design tokens',
                },
              });
            }
          });
        });
      },
    };
  },
};
