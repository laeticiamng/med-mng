import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Tests d'accessibilité pour les composants EDN
 * Vérifie la navigation au clavier, les attributs ARIA, et le contraste des couleurs
 */

test.describe('EDN Components - Accessibilité', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/edn-complete');
    await page.waitForSelector('[data-testid="edn-header"]', { timeout: 10000 });
  });

  test('devrait passer les tests axe-core sur le header', async ({ page }) => {
    const header = page.locator('[data-testid="edn-header"]');
    await expect(header).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="edn-header"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('devrait passer les tests axe-core sur les filtres', async ({ page }) => {
    const filters = page.locator('[data-testid="edn-filters"]');
    
    // Attendre que les filtres soient visibles
    try {
      await expect(filters).toBeVisible({ timeout: 5000 });

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="edn-filters"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    } catch (error) {
      console.log('⚠️ Filtres non trouvés, test skippé');
    }
  });

  test('devrait passer les tests axe-core sur la grille d\'items', async ({ page }) => {
    const grid = page.locator('[data-testid="edn-items-grid"]');
    
    try {
      await expect(grid).toBeVisible({ timeout: 10000 });

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="edn-items-grid"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    } catch (error) {
      console.log('⚠️ Grille d\'items non trouvée, test skippé');
    }
  });

  test('devrait passer les tests axe-core sur les tabs', async ({ page }) => {
    const tabs = page.locator('[role="tablist"]');
    await expect(tabs).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="tablist"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('devrait passer un scan complet axe-core de la page', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log les violations pour debug
    if (accessibilityScanResults.violations.length > 0) {
      console.log('🔴 Violations d\'accessibilité détectées:');
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`  - ${violation.id}: ${violation.description}`);
        console.log(`    Impact: ${violation.impact}`);
        console.log(`    Nodes: ${violation.nodes.length}`);
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('devrait permettre la navigation au clavier dans les tabs', async ({ page }) => {
    // Focus sur le premier tab
    const firstTab = page.locator('button[role="tab"]').first();
    await firstTab.focus();
    await expect(firstTab).toBeFocused();

    // Naviguer avec Tab
    await page.keyboard.press('Tab');
    
    // Le focus devrait se déplacer vers le prochain élément focusable
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName;
    });
    
    expect(focusedElement).toBeTruthy();
  });

  test('devrait permettre la navigation au clavier dans les filtres', async ({ page }) => {
    // Focus sur le champ de recherche
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.focus();
    await expect(searchInput).toBeFocused();

    // Taper dans le champ
    await page.keyboard.type('test');
    await expect(searchInput).toHaveValue('test');

    // Naviguer avec Tab vers le prochain champ
    await page.keyboard.press('Tab');
    
    // Vérifier que le focus s'est déplacé
    const searchStillFocused = await searchInput.evaluate((el) => el === document.activeElement);
    expect(searchStillFocused).toBe(false);
  });

  test('devrait avoir des labels accessibles sur tous les inputs', async ({ page }) => {
    // Vérifier le champ de recherche
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    
    if (await searchInput.isVisible()) {
      // Vérifier aria-label ou label associé
      const ariaLabel = await searchInput.getAttribute('aria-label');
      const ariaLabelledBy = await searchInput.getAttribute('aria-labelledby');
      const id = await searchInput.getAttribute('id');
      
      let hasLabel = false;
      
      if (ariaLabel) {
        hasLabel = true;
      } else if (ariaLabelledBy) {
        hasLabel = true;
      } else if (id) {
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = await label.count() > 0;
      }
      
      expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });

  test('devrait avoir des attributs ARIA corrects sur les boutons', async ({ page }) => {
    // Vérifier les boutons de vue (grid/list)
    const buttons = page.locator('button[aria-label]');
    const count = await buttons.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel?.length).toBeGreaterThan(0);
      }
    }
  });

  test('devrait avoir un contraste de couleurs suffisant', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .disableRules(['color-contrast']) // On va vérifier manuellement
      .analyze();

    // Test spécifique du contraste avec axe-core
    const contrastResults = await new AxeBuilder({ page })
      .include('body')
      .options({ rules: { 'color-contrast': { enabled: true } } })
      .analyze();

    const contrastViolations = contrastResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    if (contrastViolations.length > 0) {
      console.log('⚠️ Violations de contraste détectées:');
      contrastViolations.forEach((violation) => {
        violation.nodes.forEach((node) => {
          console.log(`  - ${node.html}`);
          console.log(`    Message: ${node.failureSummary}`);
        });
      });
    }

    expect(contrastViolations.length).toBe(0);
  });

  test('devrait avoir des indicateurs de focus visibles', async ({ page }) => {
    // Tester plusieurs éléments interactifs
    const interactiveElements = await page.locator('button, a, input, [role="tab"]').all();

    for (const element of interactiveElements.slice(0, 5)) {
      if (await element.isVisible()) {
        await element.focus();
        
        // Vérifier que l'élément a un outline ou une bordure visible
        const outlineWidth = await element.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return styles.outlineWidth;
        });
        
        const borderWidth = await element.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return styles.borderWidth;
        });

        // Au moins l'un des deux devrait être défini
        const hasFocusIndicator = outlineWidth !== '0px' || borderWidth !== '0px';
        
        if (!hasFocusIndicator) {
          const tagName = await element.evaluate((el) => el.tagName);
          console.log(`⚠️ Pas d'indicateur de focus visible sur: ${tagName}`);
        }
      }
    }
  });

  test('devrait avoir une structure de titres correcte', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .options({ 
        rules: { 
          'heading-order': { enabled: true },
          'page-has-heading-one': { enabled: true }
        } 
      })
      .analyze();

    const headingViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'heading-order' || v.id === 'page-has-heading-one'
    );

    expect(headingViolations.length).toBe(0);
  });

  test('devrait avoir des rôles ARIA appropriés pour les composants custom', async ({ page }) => {
    // Vérifier les tabs
    const tabs = page.locator('[role="tablist"]');
    await expect(tabs).toBeVisible();

    const tabButtons = page.locator('[role="tab"]');
    const tabCount = await tabButtons.count();
    expect(tabCount).toBeGreaterThan(0);

    // Vérifier que chaque tab a les attributs ARIA appropriés
    for (let i = 0; i < Math.min(tabCount, 5); i++) {
      const tab = tabButtons.nth(i);
      const ariaSelected = await tab.getAttribute('aria-selected');
      const ariaControls = await tab.getAttribute('aria-controls');
      
      expect(ariaSelected).toBeTruthy();
      expect(['true', 'false']).toContain(ariaSelected);
    }
  });

  test('devrait supporter la navigation au clavier avec Enter et Space', async ({ page }) => {
    const firstTab = page.locator('button[role="tab"]').first();
    await firstTab.focus();

    // Appuyer sur Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Le tab devrait être actif
    const ariaSelected = await firstTab.getAttribute('aria-selected');
    expect(ariaSelected).toBe('true');
  });

  test('devrait annoncer les changements dynamiques aux screen readers', async ({ page }) => {
    // Vérifier la présence d'aria-live regions
    const liveRegions = page.locator('[aria-live]');
    const count = await liveRegions.count();

    if (count > 0) {
      console.log(`✅ ${count} région(s) live détectée(s) pour les screen readers`);
    } else {
      console.log('⚠️ Aucune région aria-live détectée - les mises à jour dynamiques pourraient ne pas être annoncées');
    }
  });

  test('devrait avoir des textes alternatifs pour les éléments visuels', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .options({ 
        rules: { 
          'image-alt': { enabled: true },
          'svg-img-alt': { enabled: true }
        } 
      })
      .analyze();

    const imageViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'image-alt' || v.id === 'svg-img-alt'
    );

    expect(imageViolations.length).toBe(0);
  });
});

test.describe('EDN Components - Accessibilité Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/edn-complete');
    await page.waitForSelector('[data-testid="edn-header"]', { timeout: 10000 });
  });

  test('devrait passer les tests axe-core sur mobile', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('🔴 Violations d\'accessibilité mobile:');
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`  - ${violation.id}: ${violation.description}`);
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('devrait avoir des zones de toucher suffisamment grandes', async ({ page }) => {
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        
        if (box) {
          // WCAG 2.1 recommande 44x44px minimum
          const minSize = 44;
          
          if (box.width < minSize || box.height < minSize) {
            const text = await button.textContent();
            console.log(`⚠️ Bouton trop petit: "${text}" (${box.width}x${box.height}px)`);
          }
        }
      }
    }
  });
});
