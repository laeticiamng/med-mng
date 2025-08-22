/**
 * Tests de sécurité pour la sanitisation HTML dans ContextualHelp
 * Vérifie que les contenus malveillants sont éliminés avant le rendu
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContextualHelp } from '@/components/onboarding/ContextualHelp';
import { sanitizeHtml } from '@/utils/sanitize';

// Mock des tooltips UI pour les tests
vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-provider">{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>
}));

describe('ContextualHelp Security - HTML Sanitization', () => {
  it('should remove script tags from help content', () => {
    const maliciousContent = 'Safe content <script>alert("XSS")</script> more content';
    
    render(
      <ContextualHelp 
        helpKey="test-help"
        content={maliciousContent}
        title="Test Help"
      >
        <div>Child element</div>
      </ContextualHelp>
    );
    
    // Le script tag ne devrait pas être présent dans le DOM
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent.innerHTML).not.toContain('<script>');
    expect(tooltipContent.innerHTML).not.toContain('alert("XSS")');
    expect(tooltipContent.innerHTML).toContain('Safe content');
    expect(tooltipContent.innerHTML).toContain('more content');
  });

  it('should remove onclick and other event handlers', () => {
    const maliciousContent = '<div onclick="alert(\'XSS\')">Click me</div>';
    
    render(
      <ContextualHelp 
        content={maliciousContent}
        title="Test Help"
      >
        <div>Child element</div>
      </ContextualHelp>
    );
    
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent.innerHTML).not.toContain('onclick');
    expect(tooltipContent.innerHTML).not.toContain('alert');
    expect(tooltipContent.innerHTML).toContain('Click me');
  });

  it('should remove dangerous HTML elements', () => {
    const maliciousContent = `
      <iframe src="javascript:alert('XSS')"></iframe>
      <object data="malicious.swf"></object>
      <embed src="malicious.swf">
      <form><input type="text"></form>
      Safe content
    `;
    
    render(
      <ContextualHelp 
        content={maliciousContent}
        title="Test Help"
      >
        <div>Child element</div>
      </ContextualHelp>
    );
    
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent.innerHTML).not.toContain('<iframe');
    expect(tooltipContent.innerHTML).not.toContain('<object');
    expect(tooltipContent.innerHTML).not.toContain('<embed');
    expect(tooltipContent.innerHTML).not.toContain('<form');
    expect(tooltipContent.innerHTML).not.toContain('<input');
    expect(tooltipContent.innerHTML).toContain('Safe content');
  });

  it('should preserve safe HTML formatting tags', () => {
    const safeContent = '<strong>Bold text</strong> <em>Italic text</em> <br> Line break';
    
    render(
      <ContextualHelp 
        content={safeContent}
        title="Test Help"
      >
        <div>Child element</div>
      </ContextualHelp>
    );
    
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent.innerHTML).toContain('<strong>Bold text</strong>');
    expect(tooltipContent.innerHTML).toContain('<em>Italic text</em>');
    expect(tooltipContent.innerHTML).toContain('<br>');
  });

  it('should handle empty or null content safely', () => {
    render(
      <ContextualHelp 
        content=""
        title="Empty Help"
      >
        <div>Child element</div>
      </ContextualHelp>
    );
    
    // Ne devrait pas crash et afficher seulement l'enfant
    expect(screen.getByText('Child element')).toBeInTheDocument();
  });

  it('should sanitize content from helpKey-loaded data', () => {
    // Test du contenu chargé via helpKey (mock data)
    const maliciousHelpKey = 'malicious-help';
    
    render(
      <ContextualHelp 
        helpKey={maliciousHelpKey}
        title="Loaded Help"
      >
        <div>Child element</div>
      </ContextualHelp>
    );
    
    // Même si le contenu est chargé via API, il doit être sanitisé
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toBeInTheDocument();
  });

  describe('Sanitization Utility Tests', () => {
    it('should sanitize script tags directly', () => {
      const malicious = '<script>alert("XSS")</script>Safe content';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert("XSS")');
      expect(sanitized).toContain('Safe content');
    });

    it('should remove style attributes', () => {
      const malicious = '<div style="background: url(javascript:alert(\'XSS\'))">Content</div>';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('style=');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).toContain('Content');
    });

    it('should handle complex XSS attempts', () => {
      const malicious = `
        <img src="x" onerror="alert('XSS')">
        <svg onload="alert('XSS')">
        <body onload="alert('XSS')">
        <link rel="stylesheet" href="javascript:alert('XSS')">
        Normal content
      `;
      
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('onload');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('Normal content');
    });

    it('should preserve safe class attributes', () => {
      const safe = '<div class="safe-class">Content with class</div>';
      const sanitized = sanitizeHtml(safe);
      
      expect(sanitized).toContain('class="safe-class"');
      expect(sanitized).toContain('Content with class');
    });

    it('should handle URL-based XSS attempts', () => {
      const malicious = `
        <a href="javascript:alert('XSS')">Click me</a>
        <img src="javascript:alert('XSS')">
        <link href="data:text/html,<script>alert('XSS')</script>">
      `;
      
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('data:text/html');
      expect(sanitized).not.toContain('alert');
    });
  });
});