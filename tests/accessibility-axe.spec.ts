import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Ouvre une page et attend son rendu final avant l'analyse axe.
 *
 * Les pages entrent en fondu (framer-motion, animations CSS) : analysées dès l'événement
 * « load », axe mesurait des textes encore à mi-opacité (ex. #c2d4f1 au lieu de la couleur
 * primaire sur l'index des ECOS) et les résultats changeaient d'une exécution à l'autre.
 * On attend donc : le réseau au repos, la fin des animations finies (les boucles infinies,
 * comme un indicateur qui tourne, et les animations liées au défilement sont ignorées) et
 * des styles en ligne stables sur deux relevés successifs (animations pilotées en
 * JavaScript). Les assertions ne changent pas.
 */
async function ouvrir(page: Page, chemin: string) {
  await page.goto(chemin);
  // Délai borné : sans timeout, une connexion qui reste ouverte bloquait jusqu'à la limite du test.
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(
    () =>
      document.getAnimations().every((animation) => {
        // endTime non numérique : animation liée au défilement (ScrollTimeline), sans fin propre.
        const fin = animation.effect?.getComputedTiming().endTime;
        return animation.playState !== 'running' || typeof fin !== 'number' || !Number.isFinite(fin);
      }),
    undefined,
    { timeout: 15000 },
  );
  let precedent = '';
  for (let essai = 0; essai < 40; essai++) {
    const releve = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[style]'))
        .map((el) => `${el.style.opacity}|${el.style.transform}`)
        .join(';'),
    );
    if (releve === precedent) return;
    precedent = releve;
    await page.waitForTimeout(150);
  }
}

/**
 * Tests d'accessibilité automatisés avec axe-core
 * Norme: WCAG 2.1 AA - RGAA 4.1
 * 
 * Lancés à la demande par .github/workflows/accessibility-ci.yml
 * (npx playwright test -c playwright.a11y.config.ts) sur le build de production.
 *
 * Seules des pages publiques sont visitées : les pages protégées (création,
 * bibliothèque personnelle, profil) redirigent un visiteur vers /med-mng/login,
 * et /contact, /edn-generator, /quiz n'existent pas (page 404). Elles ont été
 * remplacées par les pages publiques réelles correspondantes.
 */

test.describe('Accessibilité automatisée avec axe-core', () => {
  test('Page d\'accueil - 0 violation WCAG 2.1 AA', async ({ page }) => {
    await ouvrir(page, '/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page de connexion - 0 violation', async ({ page }) => {
    await ouvrir(page, '/med-mng/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Catalogue des items EDN - 0 violation', async ({ page }) => {
    await ouvrir(page, '/edn-complete');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page tarification - 0 violation', async ({ page }) => {
    await ouvrir(page, '/med-mng/pricing');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page d\'inscription - 0 violation', async ({ page }) => {
    await ouvrir(page, '/med-mng/signup');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Déclaration d\'accessibilité - 0 violation', async ({ page }) => {
    await ouvrir(page, '/declaration-accessibilite');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Politique de confidentialité - 0 violation', async ({ page }) => {
    await ouvrir(page, '/politique-confidentialite');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('CGU - 0 violation', async ({ page }) => {
    await ouvrir(page, '/cgu');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Mentions légales - 0 violation', async ({ page }) => {
    await ouvrir(page, '/mentions-legales');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('FAQ - 0 violation', async ({ page }) => {
    await ouvrir(page, '/faq');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Index des ECOS - 0 violation', async ({ page }) => {
    await ouvrir(page, '/ecos');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Méthode MNG - 0 violation', async ({ page }) => {
    await ouvrir(page, '/mng-method');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Tests d\'accessibilité avec règles personnalisées RGAA', () => {
  test('Navigation au clavier - Tous les éléments interactifs', async ({ page }) => {
    await ouvrir(page, '/');
    
    // Test que tous les boutons sont accessibles au clavier
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('button, a, input, select, textarea')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Contraste des couleurs - Ratio minimum 4.5:1', async ({ page }) => {
    await ouvrir(page, '/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Images - Alternatives textuelles présentes', async ({ page }) => {
    await ouvrir(page, '/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Formulaires - Labels associés aux champs', async ({ page }) => {
    await ouvrir(page, '/med-mng/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label', 'label-title-only'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Landmarks ARIA - Navigation structurée', async ({ page }) => {
    await ouvrir(page, '/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['landmark-one-main', 'region'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Headings - Hiérarchie correcte', async ({ page }) => {
    await ouvrir(page, '/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Zones tactiles mobiles - Minimum 44x44px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await ouvrir(page, '/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['target-size'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Tests d\'accessibilité avancés - Lecteur audio', () => {
  // Le lecteur (MusicPlayer, aria-label « Lecteur audio pour … ») n'est rendu que dans la
  // bibliothèque personnelle protégée : sans compte de test il ne peut pas être atteint.
  // /edn/music-library a été retirée (MM-A13) : on vérifie les boutons du catalogue public.
  test('Boutons de contrôle - Labels ARIA', async ({ page }) => {
    await ouvrir(page, '/edn-complete');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['button-name', 'aria-command-name'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Rapport d\'accessibilité complet', () => {
  test('Génération du rapport complet', async ({ page }) => {
    await ouvrir(page, '/');
    
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
