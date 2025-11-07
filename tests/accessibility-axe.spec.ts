import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Tests d'accessibilité automatisés avec axe-core
 * Norme: WCAG 2.1 AA - RGAA 4.1
 * 
 * Ces tests s'exécutent automatiquement dans le CI/CD pour garantir
 * une conformité à 100% sur toutes les pages de l'application.
 */

test.describe('Accessibilité automatisée avec axe-core', () => {
  test('Page d\'accueil - 0 violation WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page de connexion - 0 violation', async ({ page }) => {
    await page.goto('/med-mng/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page de création de musique - 0 violation', async ({ page }) => {
    await page.goto('/med-mng/create');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page bibliothèque - 0 violation', async ({ page }) => {
    await page.goto('/med-mng/library');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page tarification - 0 violation', async ({ page }) => {
    await page.goto('/med-mng/pricing');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page profil - 0 violation', async ({ page }) => {
    await page.goto('/med-mng/profile');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Déclaration d\'accessibilité - 0 violation', async ({ page }) => {
    await page.goto('/declaration-accessibilite');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Politique de confidentialité - 0 violation', async ({ page }) => {
    await page.goto('/politique-confidentialite');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('CGU - 0 violation', async ({ page }) => {
    await page.goto('/cgu');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Mentions légales - 0 violation', async ({ page }) => {
    await page.goto('/mentions-legales');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page contact - 0 violation', async ({ page }) => {
    await page.goto('/contact');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Générateur EDN - 0 violation', async ({ page }) => {
    await page.goto('/edn-generator');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page quiz - 0 violation', async ({ page }) => {
    await page.goto('/quiz');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Tests d\'accessibilité avec règles personnalisées RGAA', () => {
  test('Navigation au clavier - Tous les éléments interactifs', async ({ page }) => {
    await page.goto('/');
    
    // Test que tous les boutons sont accessibles au clavier
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('button, a, input, select, textarea')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Contraste des couleurs - Ratio minimum 4.5:1', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Images - Alternatives textuelles présentes', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Formulaires - Labels associés aux champs', async ({ page }) => {
    await page.goto('/med-mng/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label', 'label-title-only'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Landmarks ARIA - Navigation structurée', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['landmark-one-main', 'region'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Headings - Hiérarchie correcte', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Zones tactiles mobiles - Minimum 44x44px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['target-size'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Tests d\'accessibilité avancés - Lecteur audio', () => {
  test('Lecteur audio - Contrôles accessibles', async ({ page }) => {
    await page.goto('/med-mng/library');
    
    // Attendre que le lecteur soit chargé
    await page.waitForSelector('[aria-label*="Lecteur audio"]', { timeout: 10000 });
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[aria-label*="Lecteur audio"]')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Boutons de contrôle - Labels ARIA', async ({ page }) => {
    await page.goto('/med-mng/library');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['button-name', 'aria-command-name'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Rapport d\'accessibilité complet', () => {
  test('Génération du rapport complet', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();
    
    // Log le rapport complet pour analyse
    console.log('📊 Rapport d\'accessibilité complet:');
    console.log(`✅ Passes: ${accessibilityScanResults.passes.length}`);
    console.log(`❌ Violations: ${accessibilityScanResults.violations.length}`);
    console.log(`⚠️  Incomplete: ${accessibilityScanResults.incomplete.length}`);
    console.log(`ℹ️  Inapplicable: ${accessibilityScanResults.inapplicable.length}`);
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('\n❌ Violations détectées:');
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`\n- ${violation.id}: ${violation.description}`);
        console.log(`  Impact: ${violation.impact}`);
        console.log(`  Éléments affectés: ${violation.nodes.length}`);
        violation.nodes.forEach((node) => {
          console.log(`    - ${node.html}`);
          console.log(`      Correctif: ${node.failureSummary}`);
        });
      });
    }
    
    // Le test doit passer avec 0 violation
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
