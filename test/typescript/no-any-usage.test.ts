/**
 * Tests pour vérifier l'absence d'usage de 'any' dans les fichiers critiques
 * Ces tests utilisent des expressions régulières pour détecter les usages de 'any'
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

describe('TypeScript Strict Mode - No Any Usage', () => {
  const criticalFiles = [
    'src/components/CASAuthTester.tsx',
    'src/utils/getCASCookies.ts',
    'src/utils/testOICAccessWithCAS.ts',
    'src/types/cas.ts'
  ];

  criticalFiles.forEach((filePath) => {
    it(`should not use 'any' type in ${filePath}`, () => {
      const fullPath = path.resolve(filePath);
      
      if (!existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }
      
      const content = readFileSync(fullPath, 'utf-8');
      
      // Regex to find 'any' usage but exclude comments and valid cases
      const anyUsageRegex = /:\s*any(?![a-zA-Z])|<any>|Array<any>|Promise<any>/g;
      const matches = content.match(anyUsageRegex);
      
      if (matches) {
        const lines = content.split('\n');
        const occurrences = matches.map(match => {
          const lineIndex = content.indexOf(match);
          const lineNumber = content.substring(0, lineIndex).split('\n').length;
          const line = lines[lineNumber - 1]?.trim();
          return `Line ${lineNumber}: ${line}`;
        });
        
        throw new Error(
          `Found 'any' usage in ${filePath}:\n${occurrences.join('\n')}`
        );
      }
      
      expect(matches).toBeNull();
    });
  });

  it('should use proper error handling with unknown type', () => {
    const casAuthTesterPath = path.resolve('src/components/CASAuthTester.tsx');
    const content = readFileSync(casAuthTesterPath, 'utf-8');
    
    // Check that catch blocks use 'unknown' instead of 'any'
    const catchBlockRegex = /catch\s*\(\s*(\w+):\s*(\w+)\s*\)/g;
    const matches = [...content.matchAll(catchBlockRegex)];
    
    matches.forEach(match => {
      const errorType = match[2];
      expect(errorType).toBe('unknown');
    });
    
    // Should have error instanceof Error checks
    expect(content).toMatch(/error instanceof Error/);
  });

  it('should have proper TypeScript configurations', () => {
    // Check that tsconfig has strict mode
    const tsconfigPath = path.resolve('tsconfig.json');
    
    if (existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
      
      // These options help prevent 'any' usage
      expect(tsconfig.compilerOptions?.strict).toBe(true);
      expect(tsconfig.compilerOptions?.noImplicitAny).toBe(true);
    }
  });

  it('should use proper type guards for runtime type checking', () => {
    const files = [
      'src/components/CASAuthTester.tsx',
      'src/utils/getCASCookies.ts',
      'src/utils/testOICAccessWithCAS.ts'
    ];
    
    files.forEach(filePath => {
      const fullPath = path.resolve(filePath);
      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, 'utf-8');
        
        // Should use proper type guards for error handling
        if (content.includes('catch')) {
          expect(content).toMatch(/error instanceof Error/);
        }
      }
    });
  });
});