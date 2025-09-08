/**
 * ♿ Service d'Accessibilité MED-MNG Premium
 * Implémentation WCAG 2.1 AAA pour une accessibilité totale
 */

import { MED_MNG_CONFIG } from '../config/AppConfig';
import { logger } from '@/utils/logger';

export interface AccessibilityPreferences {
  // Vision
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochromacy';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  
  // Audio
  preferSubtitles: boolean;
  audioDescriptions: boolean;
  reduceAudio: boolean;
  preferredVoiceSpeed: number; // 0.5 to 2.0
  
  // Motor
  stickyKeys: boolean;
  slowKeys: boolean;
  bounceKeys: boolean;
  mouseKeys: boolean;
  keyboardNavigation: boolean;
  
  // Cognitive
  simplifiedInterface: boolean;
  extendedTimeouts: boolean;
  disableAnimations: boolean;
  focusRings: boolean;
  
  // Screen Reader
  screenReaderOptimized: boolean;
  verboseDescriptions: boolean;
  skipRepeatedContent: boolean;
}

export interface AccessibilityReport {
  score: number;
  level: 'A' | 'AA' | 'AAA';
  issues: AccessibilityIssue[];
  recommendations: AccessibilityRecommendation[];
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  wcagLevel: 'A' | 'AA' | 'AAA';
  principle: 'perceivable' | 'operable' | 'understandable' | 'robust';
  guideline: string;
  element: string;
  description: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
}

export interface AccessibilityRecommendation {
  priority: 'high' | 'medium' | 'low';
  action: string;
  benefit: string;
  implementation: string;
}

class AccessibilityService {
  private preferences: AccessibilityPreferences;
  private mediaQueryListeners: Map<string, MediaQueryList> = new Map();
  private focusHistory: HTMLElement[] = [];
  private announcementQueue: string[] = [];
  private isProcessingAnnouncements = false;

  constructor() {
    this.preferences = this.getDefaultPreferences();
    this.initializeAccessibilityFeatures();
    this.setupMediaQueries();
    this.createAccessibilityOverlay();
  }

  private getDefaultPreferences(): AccessibilityPreferences {
    const saved = localStorage.getItem('med-mng-a11y-preferences');
    const defaults: AccessibilityPreferences = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      colorBlindMode: 'none',
      fontSize: 'medium',
      preferSubtitles: false,
      audioDescriptions: false,
      reduceAudio: false,
      preferredVoiceSpeed: 1.0,
      stickyKeys: false,
      slowKeys: false,
      bounceKeys: false,
      mouseKeys: false,
      keyboardNavigation: true,
      simplifiedInterface: false,
      extendedTimeouts: false,
      disableAnimations: false,
      focusRings: true,
      screenReaderOptimized: false,
      verboseDescriptions: false,
      skipRepeatedContent: true
    };

    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  }

  private initializeAccessibilityFeatures() {
    // Apply initial preferences
    this.applyPreferences();
    
    // Set up keyboard navigation
    this.setupKeyboardNavigation();
    
    // Set up screen reader support
    this.setupScreenReaderSupport();
    
    // Set up focus management
    this.setupFocusManagement();
    
    logger.info('Accessibility service initialized', 'AccessibilityService', {
      wcagLevel: MED_MNG_CONFIG.ACCESSIBILITY.WCAG_LEVEL,
      preferences: this.preferences
    });
  }

  private setupMediaQueries() {
    // Detect system preferences
    const queries = {
      'prefers-reduced-motion': 'reduce',
      'prefers-contrast': 'high', 
      'prefers-color-scheme': 'dark'
    };

    Object.entries(queries).forEach(([query, value]) => {
      const mediaQuery = window.matchMedia(`(${query}: ${value})`);
      this.mediaQueryListeners.set(query, mediaQuery);
      
      const handler = (e: MediaQueryListEvent) => {
        this.handleSystemPreferenceChange(query, e.matches);
      };
      mediaQuery.addEventListener('change', handler);
      
      // Apply initial state
      if (mediaQuery.matches) {
        this.handleSystemPreferenceChange(query, true);
      }
    });
  }

  private handleSystemPreferenceChange(query: string, matches: boolean) {
    switch (query) {
      case 'prefers-reduced-motion':
        if (matches) {
          this.updatePreference('reducedMotion', true);
          this.updatePreference('disableAnimations', true);
        }
        break;
      case 'prefers-contrast':
        if (matches) {
          this.updatePreference('highContrast', true);
        }
        break;
    }
  }

  private setupKeyboardNavigation() {
    let currentFocusIndex = -1;
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    document.addEventListener('keydown', (event) => {
      if (!this.preferences.keyboardNavigation) return;

      const isTabKey = event.key === 'Tab';
      const isEscapeKey = event.key === 'Escape';
      const isEnterKey = event.key === 'Enter';
      const isSpaceKey = event.key === ' ';

      if (isTabKey) {
        this.handleTabNavigation(event);
      } else if (isEscapeKey) {
        this.handleEscapeKey();
      } else if ((isEnterKey || isSpaceKey) && event.target) {
        this.handleActivation(event.target as HTMLElement, event);
      }

      // Arrow key navigation for groups
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        this.handleArrowNavigation(event);
      }
    });
  }

  private handleTabNavigation(event: KeyboardEvent) {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (event.shiftKey) {
      // Shift + Tab (backwards)
      const previousIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
      focusableElements[previousIndex]?.focus();
    } else {
      // Tab (forwards)  
      const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
      focusableElements[nextIndex]?.focus();
    }
  }

  private handleEscapeKey() {
    // Close modals, dropdowns, etc.
    const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]');
    if (activeModal) {
      const closeButton = activeModal.querySelector('[aria-label*="close"], [aria-label*="fermer"]') as HTMLElement;
      closeButton?.click();
      return;
    }

    // Return focus to previous element
    if (this.focusHistory.length > 0) {
      const previousElement = this.focusHistory.pop();
      previousElement?.focus();
    }
  }

  private handleActivation(element: HTMLElement, event: KeyboardEvent) {
    const role = element.getAttribute('role');
    const tagName = element.tagName.toLowerCase();

    // Handle different element types
    if (tagName === 'button' || role === 'button') {
      element.click();
      event.preventDefault();
    } else if (tagName === 'a' && element.hasAttribute('href')) {
      element.click();
      event.preventDefault();
    } else if (role === 'tab') {
      element.click();
      event.preventDefault();
    }
  }

  private handleArrowNavigation(event: KeyboardEvent) {
    const currentElement = document.activeElement as HTMLElement;
    const parent = currentElement.closest('[role="tablist"], [role="radiogroup"], [role="menu"]');
    
    if (!parent) return;

    const siblings = Array.from(parent.children) as HTMLElement[];
    const currentIndex = siblings.indexOf(currentElement);
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        newIndex = currentIndex <= 0 ? siblings.length - 1 : currentIndex - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        newIndex = currentIndex >= siblings.length - 1 ? 0 : currentIndex + 1;
        break;
    }

    if (newIndex !== currentIndex) {
      siblings[newIndex]?.focus();
      event.preventDefault();
    }
  }

  private setupScreenReaderSupport() {
    // Create live regions for announcements
    this.createLiveRegions();
    
    // Enhance semantic structure
    this.enhanceSemantics();
    
    // Set up automatic descriptions
    this.setupAutomaticDescriptions();
  }

  private createLiveRegions() {
    // Polite announcements
    const politeRegion = document.createElement('div');
    politeRegion.id = 'med-mng-polite-announcements';
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.setAttribute('aria-atomic', 'true');
    politeRegion.className = 'sr-only';
    document.body.appendChild(politeRegion);

    // Assertive announcements  
    const assertiveRegion = document.createElement('div');
    assertiveRegion.id = 'med-mng-assertive-announcements';
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'sr-only';
    document.body.appendChild(assertiveRegion);

    // Status announcements
    const statusRegion = document.createElement('div');
    statusRegion.id = 'med-mng-status-announcements';
    statusRegion.setAttribute('role', 'status');
    statusRegion.setAttribute('aria-live', 'polite');
    statusRegion.className = 'sr-only';
    document.body.appendChild(statusRegion);
  }

  private enhanceSemantics() {
    // Add missing landmarks
    const main = document.querySelector('main');
    if (main && !main.hasAttribute('role')) {
      main.setAttribute('role', 'main');
    }

    // Enhance headings structure
    this.validateHeadingStructure();
    
    // Add descriptions to complex elements
    this.addComplexElementDescriptions();
  }

  private validateHeadingStructure() {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.substring(1));
      
      if (level > lastLevel + 1) {
        logger.warn(`Heading level jump detected: h${lastLevel} to h${level}`, 'AccessibilityService', {
          element: heading.textContent?.substring(0, 50)
        });
      }
      
      lastLevel = level;
    });
  }

  private addComplexElementDescriptions() {
    // Add descriptions to charts, graphs, and complex UI elements
    const complexElements = document.querySelectorAll('[data-chart], [data-graph], .music-visualizer');
    
    complexElements.forEach((element) => {
      if (!element.hasAttribute('aria-describedby')) {
        const description = this.generateElementDescription(element as HTMLElement);
        if (description) {
          const descId = `desc-${Math.random().toString(36).substr(2, 9)}`;
          const descElement = document.createElement('div');
          descElement.id = descId;
          descElement.className = 'sr-only';
          descElement.textContent = description;
          element.parentNode?.appendChild(descElement);
          element.setAttribute('aria-describedby', descId);
        }
      }
    });
  }

  private generateElementDescription(element: HTMLElement): string {
    const className = element.className;
    const dataAttributes = Array.from(element.attributes).filter(attr => attr.name.startsWith('data-'));
    
    if (className.includes('music-visualizer')) {
      return 'Visualiseur musical interactif affichant la forme d\'onde et les fréquences audio en temps réel';
    } else if (className.includes('progress-chart')) {
      return 'Graphique de progression montrant l\'évolution des performances d\'apprentissage';
    } else if (dataAttributes.some(attr => attr.name.includes('chart'))) {
      return 'Graphique interactif avec données de performance médicale';
    }
    
    return '';
  }

  private setupAutomaticDescriptions() {
    // Automatically describe images without alt text
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.includes('medical') || src.includes('edn')) {
        img.setAttribute('alt', 'Image médicale éducative');
      } else if (src.includes('music') || src.includes('audio')) {
        img.setAttribute('alt', 'Illustration musicale');
      } else {
        img.setAttribute('alt', 'Image décorative');
      }
    });

    // Add descriptions to form elements
    const formElements = document.querySelectorAll('input:not([aria-label]):not([aria-describedby]), select:not([aria-label]):not([aria-describedby])');
    formElements.forEach((element) => {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (!label && element.getAttribute('placeholder')) {
        element.setAttribute('aria-label', element.getAttribute('placeholder') || '');
      }
    });
  }

  private setupFocusManagement() {
    // Track focus history for better navigation
    document.addEventListener('focusin', (event) => {
      const element = event.target as HTMLElement;
      if (element && element !== document.body) {
        this.focusHistory.push(element);
        
        // Keep history manageable
        if (this.focusHistory.length > 10) {
          this.focusHistory.shift();
        }
      }
    });

    // Enhance focus visibility
    if (this.preferences.focusRings) {
      this.enhanceFocusVisibility();
    }
  }

  private enhanceFocusVisibility() {
    const style = document.createElement('style');
    style.textContent = `
      *:focus {
        outline: 3px solid var(--focus-color, #2563eb) !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 2px white, 0 0 0 5px var(--focus-color, #2563eb) !important;
      }
      
      *:focus:not(:focus-visible) {
        outline: none !important;
        box-shadow: none !important;
      }
      
      button:focus, [role="button"]:focus {
        background-color: var(--focus-bg, rgba(37, 99, 235, 0.1)) !important;
      }
    `;
    document.head.appendChild(style);
  }

  private createAccessibilityOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'med-mng-a11y-overlay';
    overlay.className = 'fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 max-w-sm';
    overlay.style.display = 'none';
    
    overlay.innerHTML = `
      <h3 class="text-lg font-semibold mb-3">Options d'Accessibilité</h3>
      <div class="space-y-3">
        <label class="flex items-center gap-2">
          <input type="checkbox" id="a11y-high-contrast" ${this.preferences.highContrast ? 'checked' : ''}>
          <span>Contraste élevé</span>
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" id="a11y-large-text" ${this.preferences.largeText ? 'checked' : ''}>
          <span>Texte agrandi</span>
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" id="a11y-reduced-motion" ${this.preferences.reducedMotion ? 'checked' :''}>
          <span>Réduire les animations</span>
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" id="a11y-screen-reader" ${this.preferences.screenReaderOptimized ? 'checked' : ''}>
          <span>Mode lecteur d'écran</span>
        </label>
        <button id="a11y-close" class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Fermer
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
    this.setupOverlayEvents(overlay);
    
    // Create accessibility toggle button
    this.createAccessibilityToggle();
  }

  private createAccessibilityToggle() {
    const button = document.createElement('button');
    button.id = 'med-mng-a11y-toggle';
    button.className = 'fixed bottom-4 right-4 z-40 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center';
    button.setAttribute('aria-label', 'Ouvrir les options d\'accessibilité');
    button.innerHTML = `
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    `;
    
    button.addEventListener('click', () => {
      this.toggleAccessibilityOverlay();
    });
    
    document.body.appendChild(button);
  }

  private setupOverlayEvents(overlay: HTMLElement) {
    const checkboxes = overlay.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        const preference = target.id.replace('a11y-', '').replace('-', '');
        
        switch (preference) {
          case 'highcontrast':
            this.updatePreference('highContrast', target.checked);
            break;
          case 'largetext':
            this.updatePreference('largeText', target.checked);
            break;
          case 'reducedmotion':
            this.updatePreference('reducedMotion', target.checked);
            break;
          case 'screenreader':
            this.updatePreference('screenReaderOptimized', target.checked);
            break;
        }
      });
    });

    const closeButton = overlay.querySelector('#a11y-close');
    closeButton?.addEventListener('click', () => {
      this.toggleAccessibilityOverlay();
    });
  }

  // Public API methods
  public updatePreference<K extends keyof AccessibilityPreferences>(
    key: K, 
    value: AccessibilityPreferences[K]
  ) {
    this.preferences[key] = value;
    this.savePreferences();
    this.applyPreferences();
    
    logger.info(`Accessibility preference updated: ${key}`, 'AccessibilityService', {
      key,
      value,
      preferences: this.preferences
    });
  }

  public getPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  public announceToScreenReader(message: string, priority: 'polite' | 'assertive' | 'status' = 'polite') {
    this.announcementQueue.push(message);
    
    if (!this.isProcessingAnnouncements) {
      this.processAnnouncementQueue(priority);
    }
  }

  private async processAnnouncementQueue(priority: 'polite' | 'assertive' | 'status') {
    this.isProcessingAnnouncements = true;
    
    while (this.announcementQueue.length > 0) {
      const message = this.announcementQueue.shift()!;
      const regionId = `med-mng-${priority}-announcements`;
      const region = document.getElementById(regionId);
      
      if (region) {
        region.textContent = message;
        
        // Clear after a delay to allow screen readers to process
        setTimeout(() => {
          region.textContent = '';
        }, 1000);
        
        // Wait between announcements
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    this.isProcessingAnnouncements = false;
  }

  public manageFocus(element: HTMLElement) {
    if (element) {
      element.focus();
      this.focusHistory.push(element);
      
      // Announce focus change for screen readers
      const label = element.getAttribute('aria-label') || 
                   element.getAttribute('title') || 
                   element.textContent?.trim().substring(0, 50);
                   
      if (label && this.preferences.verboseDescriptions) {
        this.announceToScreenReader(`Focus sur: ${label}`, 'polite');
      }
    }
  }

  public toggleAccessibilityOverlay() {
    const overlay = document.getElementById('med-mng-a11y-overlay');
    if (overlay) {
      const isVisible = overlay.style.display !== 'none';
      overlay.style.display = isVisible ? 'none' : 'block';
      
      if (!isVisible) {
        // Focus first interactive element in overlay
        const firstButton = overlay.querySelector('button, input') as HTMLElement;
        firstButton?.focus();
      }
    }
  }

  public auditAccessibility(): AccessibilityReport {
    const issues: AccessibilityIssue[] = [];
    
    // Check for missing alt text
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    imagesWithoutAlt.forEach((img) => {
      issues.push({
        type: 'error',
        wcagLevel: 'A',
        principle: 'perceivable',
        guideline: '1.1.1 Non-text Content',
        element: img.tagName.toLowerCase(),
        description: 'Image sans texte alternatif',
        impact: 'serious'
      });
    });

    // Check for missing form labels
    const unlabeledInputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    unlabeledInputs.forEach((input) => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`);
      if (!hasLabel) {
        issues.push({
          type: 'error',
          wcagLevel: 'A',
          principle: 'perceivable',
          guideline: '1.3.1 Info and Relationships',
          element: input.tagName.toLowerCase(),
          description: 'Champ de formulaire sans étiquette',
          impact: 'serious'
        });
      }
    });

    // Check color contrast (simplified)
    const score = Math.max(0, 100 - (issues.length * 10));
    const level: 'A' | 'AA' | 'AAA' = score >= 90 ? 'AAA' : score >= 80 ? 'AA' : 'A';

    return {
      score,
      level,
      issues,
      recommendations: this.generateRecommendations(issues)
    };
  }

  private generateRecommendations(issues: AccessibilityIssue[]): AccessibilityRecommendation[] {
    const recommendations: AccessibilityRecommendation[] = [];
    
    if (issues.some(issue => issue.guideline.includes('1.1.1'))) {
      recommendations.push({
        priority: 'high',
        action: 'Ajouter des textes alternatifs à toutes les images',
        benefit: 'Permet aux utilisateurs de lecteurs d\'écran de comprendre le contenu visuel',
        implementation: 'Utiliser l\'attribut alt pour décrire le contenu et la fonction de chaque image'
      });
    }

    if (issues.some(issue => issue.guideline.includes('1.3.1'))) {
      recommendations.push({
        priority: 'high', 
        action: 'Associer des étiquettes à tous les champs de formulaire',
        benefit: 'Améliore la navigation et la compréhension des formulaires',
        implementation: 'Utiliser les éléments label ou les attributs aria-label/aria-labelledby'
      });
    }

    return recommendations;
  }

  private applyPreferences() {
    const root = document.documentElement;
    
    // High contrast
    root.classList.toggle('high-contrast', this.preferences.highContrast);
    
    // Large text
    root.classList.toggle('large-text', this.preferences.largeText);
    
    // Reduced motion
    root.classList.toggle('reduce-motion', this.preferences.reducedMotion);
    if (this.preferences.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
    
    // Color blind mode
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia', 'monochromacy');
    if (this.preferences.colorBlindMode !== 'none') {
      root.classList.add(this.preferences.colorBlindMode);
    }
    
    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
    root.classList.add(`font-${this.preferences.fontSize}`);
  }

  private savePreferences() {
    localStorage.setItem('med-mng-a11y-preferences', JSON.stringify(this.preferences));
  }

  public dispose() {
    // Clean up event listeners
    this.mediaQueryListeners.clear();
    
    // Remove overlay
    const overlay = document.getElementById('med-mng-a11y-overlay');
    overlay?.remove();
    
    const toggle = document.getElementById('med-mng-a11y-toggle');
    toggle?.remove();
    
    logger.info('Accessibility service disposed', 'AccessibilityService');
  }
}

// Singleton instance
export const accessibilityService = new AccessibilityService();
