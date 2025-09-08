// ==========================================
// MED-MNG ACCESSIBILITY SERVICE
// Service d'accessibilité WCAG 2.1 AAA
// ==========================================

import { appConfig } from '../config/AppConfig';

interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  focusRing: boolean;
  keyboardNavigation: boolean;
  voiceCommands: boolean;
  audioDescriptions: boolean;
}

interface AccessibilityAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  type: 'status' | 'alert' | 'log';
}

export class AccessibilityService {
  private preferences: AccessibilityPreferences;
  private announcementRegion: HTMLElement | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;
  private keyboardListeners: Map<string, (event: KeyboardEvent) => void> = new Map();

  constructor() {
    this.preferences = this.getDefaultPreferences();
    this.initialize();
  }

  private getDefaultPreferences(): AccessibilityPreferences {
    return {
      reduceMotion: false,
      highContrast: false,
      largeText: false,
      screenReaderOptimized: false,
      colorBlindMode: 'none',
      focusRing: true,
      keyboardNavigation: true,
      voiceCommands: false,
      audioDescriptions: false
    };
  }

  private initialize() {
    this.detectSystemPreferences();
    this.loadUserPreferences();
    this.createAnnouncementRegions();
    this.setupKeyboardNavigation();
    this.initializeSpeechSynthesis();
    this.applyAccessibilityStyles();
  }

  private detectSystemPreferences() {
    if (typeof window === 'undefined') return;

    // Détection des préférences système
    const mediaQueries = {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      largeText: window.matchMedia('(prefers-font-size: large)')
    };

    // Appliquer les préférences système
    this.preferences.reduceMotion = mediaQueries.reduceMotion.matches;
    this.preferences.highContrast = mediaQueries.highContrast.matches;
    this.preferences.largeText = mediaQueries.largeText.matches;

    // Écouter les changements
    Object.entries(mediaQueries).forEach(([key, query]) => {
      query.addEventListener('change', (e) => {
        this.updatePreference(key as keyof AccessibilityPreferences, e.matches);
      });
    });

    // Détection de lecteur d'écran
    this.detectScreenReader();
  }

  private detectScreenReader() {
    const screenReaderIndicators = [
      'NVDA', 'JAWS', 'WindowEyes', 'VoiceOver', 'TalkBack', 'ChromeVox'
    ];

    const userAgent = navigator.userAgent;
    const hasScreenReaderIndicator = screenReaderIndicators.some(sr => 
      userAgent.includes(sr)
    );

    const hasScreenReaderAPI = 'speechSynthesis' in window;
    const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

    if (hasScreenReaderIndicator || hasScreenReaderAPI || hasSpeechRecognition) {
      this.updatePreference('screenReaderOptimized', true);
    }
  }

  private loadUserPreferences() {
    try {
      const saved = localStorage.getItem('accessibility-preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.preferences = { ...this.preferences, ...parsed };
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences d\'accessibilité:', error);
    }
  }

  private saveUserPreferences() {
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences d\'accessibilité:', error);
    }
  }

  private createAnnouncementRegions() {
    if (typeof document === 'undefined') return;

    // Créer les régions d'annonce pour lecteurs d'écran
    this.announcementRegion = document.createElement('div');
    this.announcementRegion.setAttribute('aria-live', 'polite');
    this.announcementRegion.setAttribute('aria-atomic', 'true');
    this.announcementRegion.className = 'sr-only';
    this.announcementRegion.id = 'accessibility-announcements';

    document.body.appendChild(this.announcementRegion);

    // Région pour annonces urgentes
    const assertiveRegion = document.createElement('div');
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'sr-only';
    assertiveRegion.id = 'accessibility-alerts';

    document.body.appendChild(assertiveRegion);
  }

  private setupKeyboardNavigation() {
    if (typeof window === 'undefined') return;

    // Navigation par tabulation améliorée
    document.addEventListener('keydown', (event) => {
      if (!this.preferences.keyboardNavigation) return;

      switch (event.key) {
        case 'Tab':
          this.handleTabNavigation(event);
          break;
        case 'Escape':
          this.handleEscapeKey(event);
          break;
        case ' ':
        case 'Enter':
          this.handleActivationKeys(event);
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          this.handleArrowNavigation(event);
          break;
      }
    });

    // Raccourcis clavier globaux
    this.registerKeyboardShortcut('Alt+a', () => this.toggleAccessibilityPanel());
    this.registerKeyboardShortcut('Alt+h', () => this.announceHeadings());
    this.registerKeyboardShortcut('Alt+l', () => this.announceLinks());
    this.registerKeyboardShortcut('Alt+r', () => this.announceRegions());
  }

  private handleTabNavigation(event: KeyboardEvent) {
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (event.shiftKey && currentIndex === 0) {
      // Wrap vers le dernier élément
      event.preventDefault();
      focusableElements[focusableElements.length - 1]?.focus();
    } else if (!event.shiftKey && currentIndex === focusableElements.length - 1) {
      // Wrap vers le premier élément
      event.preventDefault();
      focusableElements[0]?.focus();
    }
  }

  private handleEscapeKey(event: KeyboardEvent) {
    // Fermer les éléments modaux ou popover
    const openDialog = document.querySelector('[role="dialog"][open]');
    const openPopover = document.querySelector('[popover]:popover-open');
    
    if (openDialog) {
      (openDialog as any).close?.();
    } else if (openPopover) {
      (openPopover as any).hidePopover?.();
    }
  }

  private handleActivationKeys(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    
    if (target.role === 'button' || target.role === 'tab') {
      event.preventDefault();
      target.click();
    }
  }

  private handleArrowNavigation(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const parent = target.parentElement;
    
    if (parent?.role === 'tablist' || parent?.role === 'menubar') {
      event.preventDefault();
      this.navigateInGroup(target, event.key, parent);
    }
  }

  private navigateInGroup(current: HTMLElement, key: string, container: HTMLElement) {
    const items = Array.from(container.children) as HTMLElement[];
    const currentIndex = items.indexOf(current);
    let nextIndex = currentIndex;

    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
    }

    items[nextIndex]?.focus();
  }

  private getFocusableElements(): HTMLElement[] {
    const selector = `
      button:not([disabled]),
      [href]:not([disabled]),
      input:not([disabled]),
      select:not([disabled]),
      textarea:not([disabled]),
      [tabindex]:not([tabindex="-1"]):not([disabled]),
      [role="button"]:not([disabled]),
      [role="tab"]:not([disabled])
    `;
    
    return Array.from(document.querySelectorAll(selector));
  }

  private registerKeyboardShortcut(combination: string, callback: () => void) {
    const handler = (event: KeyboardEvent) => {
      if (this.matchesShortcut(event, combination)) {
        event.preventDefault();
        callback();
      }
    };

    this.keyboardListeners.set(combination, handler);
    document.addEventListener('keydown', handler);
  }

  private matchesShortcut(event: KeyboardEvent, combination: string): boolean {
    const parts = combination.split('+');
    const key = parts[parts.length - 1].toLowerCase();
    
    const modifiers = parts.slice(0, -1).map(m => m.toLowerCase());
    
    return (
      event.key.toLowerCase() === key &&
      modifiers.includes('ctrl') === event.ctrlKey &&
      modifiers.includes('alt') === event.altKey &&
      modifiers.includes('shift') === event.shiftKey &&
      modifiers.includes('meta') === event.metaKey
    );
  }

  private initializeSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  private applyAccessibilityStyles() {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Appliquer les classes CSS
    root.classList.toggle('high-contrast', this.preferences.highContrast);
    root.classList.toggle('large-text', this.preferences.largeText);
    root.classList.toggle('reduce-motion', this.preferences.reduceMotion);
    root.classList.toggle('enhanced-focus', this.preferences.focusRing);
    root.classList.toggle('keyboard-navigation', this.preferences.keyboardNavigation);

    // Mode daltonien
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (this.preferences.colorBlindMode !== 'none') {
      root.classList.add(this.preferences.colorBlindMode);
    }
  }

  // Méthodes publiques

  updatePreference<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ): void {
    this.preferences[key] = value;
    this.saveUserPreferences();
    this.applyAccessibilityStyles();

    // Annoncer le changement
    this.announce(`Préférence ${key} ${value ? 'activée' : 'désactivée'}`, 'polite');
  }

  getPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcementRegion) return;

    const regionId = priority === 'assertive' ? 'accessibility-alerts' : 'accessibility-announcements';
    const region = document.getElementById(regionId);
    
    if (region) {
      region.textContent = message;
      
      // Nettoyer après annonce
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }

    // Synthèse vocale si activée
    if (this.preferences.voiceCommands && this.speechSynthesis) {
      this.speak(message);
    }
  }

  speak(text: string, options: SpeechSynthesisUtteranceOptions = {}): void {
    if (!this.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.8;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 0.8;
    utterance.lang = options.lang || 'fr-FR';

    this.speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  announceNavigation(location: string): void {
    this.announce(`Navigation vers ${location}`, 'polite');
  }

  announceAction(action: string, result: 'success' | 'error'): void {
    const message = result === 'success' 
      ? `${action} réalisé avec succès`
      : `Erreur lors de ${action}`;
    this.announce(message, 'assertive');
  }

  announceLoading(isLoading: boolean, context?: string): void {
    const message = isLoading 
      ? `Chargement ${context ? `de ${context}` : 'en cours'}`
      : 'Chargement terminé';
    this.announce(message, 'polite');
  }

  announceHeadings(): void {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => `${h.tagName.toLowerCase()}: ${h.textContent}`)
      .join(', ');
    
    this.announce(`Titres de la page: ${headings}`, 'polite');
  }

  announceLinks(): void {
    const links = Array.from(document.querySelectorAll('a[href]'))
      .map(link => link.textContent)
      .filter(text => text?.trim())
      .slice(0, 10) // Limiter à 10 liens
      .join(', ');
    
    this.announce(`Liens de la page: ${links}`, 'polite');
  }

  announceRegions(): void {
    const regions = Array.from(document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]'))
      .map(region => region.getAttribute('aria-label') || region.getAttribute('role'))
      .join(', ');
    
    this.announce(`Régions de la page: ${regions}`, 'polite');
  }

  toggleAccessibilityPanel(): void {
    // Implémentation pour ouvrir/fermer le panneau d'accessibilité
    const panel = document.getElementById('accessibility-panel');
    if (panel) {
      const isVisible = !panel.hasAttribute('hidden');
      panel.toggleAttribute('hidden', isVisible);
      this.announce(isVisible ? 'Panneau d\'accessibilité fermé' : 'Panneau d\'accessibilité ouvert', 'polite');
    }
  }

  validateAccessibility(): Promise<AccessibilityReport> {
    return new Promise((resolve) => {
      const issues: AccessibilityIssue[] = [];

      // Vérifier les images sans alt
      document.querySelectorAll('img:not([alt])').forEach(img => {
        issues.push({
          element: img as HTMLElement,
          rule: 'Images must have alt text',
          severity: 'error',
          wcag: '1.1.1'
        });
      });

      // Vérifier les liens sans texte
      document.querySelectorAll('a:not([aria-label])').forEach(link => {
        if (!link.textContent?.trim()) {
          issues.push({
            element: link as HTMLElement,
            rule: 'Links must have accessible text',
            severity: 'error',
            wcag: '2.4.4'
          });
        }
      });

      // Vérifier les contrastes de couleur
      this.checkColorContrast(issues);

      resolve({
        passed: issues.filter(i => i.severity !== 'error').length,
        failed: issues.filter(i => i.severity === 'error').length,
        issues,
        score: Math.max(0, 100 - (issues.filter(i => i.severity === 'error').length * 10))
      });
    });
  }

  private checkColorContrast(issues: AccessibilityIssue[]): void {
    // Vérification basique du contraste (simplifiée)
    const elements = document.querySelectorAll('*');
    
    elements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Logique de vérification du contraste (simplifiée)
      if (this.hasLowContrast(color, backgroundColor)) {
        issues.push({
          element: element as HTMLElement,
          rule: 'Insufficient color contrast',
          severity: 'warning',
          wcag: '1.4.3'
        });
      }
    });
  }

  private hasLowContrast(foreground: string, background: string): boolean {
    // Implémentation simplifiée - dans la réalité, il faudrait
    // convertir les couleurs en valeurs numériques et calculer le ratio
    return false; // Placeholder
  }

  dispose(): void {
    // Nettoyer les listeners
    this.keyboardListeners.forEach((handler, combination) => {
      document.removeEventListener('keydown', handler);
    });
    this.keyboardListeners.clear();

    // Arrêter la synthèse vocale
    this.stopSpeaking();

    // Supprimer les régions d'annonce
    if (this.announcementRegion) {
      this.announcementRegion.remove();
    }
  }
}

interface AccessibilityIssue {
  element: HTMLElement;
  rule: string;
  severity: 'error' | 'warning' | 'info';
  wcag: string;
}

interface AccessibilityReport {
  passed: number;
  failed: number;
  issues: AccessibilityIssue[];
  score: number;
}

interface SpeechSynthesisUtteranceOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

// Instance singleton
export const accessibilityService = new AccessibilityService();
export default AccessibilityService;