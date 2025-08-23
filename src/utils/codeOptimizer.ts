/**
 * Utilitaires pour optimisation automatique du code
 */

import { logger } from '@/lib/logger';

// Remplacement intelligent des console.log
export const replaceConsoleLogsInFile = (content: string, filename: string): string => {
  let optimizedContent = content;
  let replacements = 0;

  // Remplacer console.log par logger approprié
  optimizedContent = optimizedContent.replace(
    /console\.log\(['"`](.*?)['"`]\)/g, 
    (match, message) => {
      replacements++;
      return `logger.info('${message}', { component: '${filename}' })`;
    }
  );

  // Remplacer console.error par logger.error
  optimizedContent = optimizedContent.replace(
    /console\.error\((.*?)\)/g,
    (match, args) => {
      replacements++;
      return `logger.error(${args})`;
    }
  );

  // Remplacer console.warn par logger.warn  
  optimizedContent = optimizedContent.replace(
    /console\.warn\((.*?)\)/g,
    (match, args) => {
      replacements++;
      return `logger.warn(${args})`;
    }
  );

  if (replacements > 0) {
    logger.info(`Code optimized: ${replacements} console statements replaced`, {
      component: 'codeOptimizer',
      filename,
      replacements
    });
  }

  return optimizedContent;
};

// Optimisation des types any
export const optimizeAnyTypes = (content: string): string => {
  let optimizedContent = content;
  
  // Remplacer : any par des types plus spécifiques
  const anyReplacements = {
    'data: any': 'data: Record<string, unknown>',
    'props: any': 'props: Record<string, unknown>',
    'item: any': 'item: Record<string, unknown>',
    'config: any': 'config: Record<string, unknown>',
    'params: any': 'params: Record<string, unknown>',
    ': any[]': ': unknown[]',
  };

  Object.entries(anyReplacements).forEach(([pattern, replacement]) => {
    optimizedContent = optimizedContent.replace(new RegExp(pattern, 'g'), replacement);
  });

  return optimizedContent;
};

// Nettoyage des imports inutilisés
export const cleanUnusedImports = (content: string): string => {
  const lines = content.split('\n');
  const importLines = lines.filter(line => line.trim().startsWith('import'));
  const codeLines = lines.filter(line => !line.trim().startsWith('import') && !line.trim().startsWith('//'));
  
  const usedImports = importLines.filter(importLine => {
    const match = importLine.match(/import\s+{([^}]+)}/);
    if (match) {
      const imports = match[1].split(',').map(imp => imp.trim());
      return imports.some(imp => 
        codeLines.some(line => line.includes(imp))
      );
    }
    return true;
  });

  return [...usedImports, '', ...codeLines].join('\n');
};

// Optimisation des performances avec memoisation
export const addPerformanceOptimizations = (content: string): string => {
  let optimizedContent = content;

  // Ajouter memo aux composants fonctionnels
  if (content.includes('export const') && content.includes('= (') && content.includes('return (')) {
    optimizedContent = optimizedContent.replace(
      /export const (\w+) = \(/,
      "import { memo } from 'react';\n\nexport const $1 = memo(("
    );
    
    optimizedContent += '\n\n$1.displayName = \'$1\';';
  }

  // Ajouter useCallback aux handlers
  optimizedContent = optimizedContent.replace(
    /(const handle\w+ = )\(([^)]*)\) => \{/g,
    '$1useCallback(($2) => {',
  );

  return optimizedContent;
};