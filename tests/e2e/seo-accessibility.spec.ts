import { test, expect } from '@playwright/test';

test.describe('SEO & Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('SEO Meta Tags', () => {
    test('should have proper meta tags', async ({ page }) => {
      // Check title
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThan(60);

      // Check meta description
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(120);
      expect(description!.length).toBeLessThan(160);

      // Check charset
      const charset = await page.locator('meta[charset]').getAttribute('charset');
      expect(charset).toBe('utf-8');

      // Check viewport
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toContain('width=device-width');
      expect(viewport).toContain('initial-scale=1');
    });

    test('should have Open Graph tags', async ({ page }) => {
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
      const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');

      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
      expect(ogType).toBeTruthy();
    });

    test('should have Twitter Card tags', async ({ page }) => {
      const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
      expect(twitterCard).toBeTruthy();
      expect(['summary', 'summary_large_image', 'app', 'player']).toContain(twitterCard);
    });

    test('should have canonical URL', async ({ page }) => {
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      if (canonical) {
        expect(canonical).toMatch(/^https?:\/\/.+/);
      }
    });
  });

  test.describe('Heading Structure', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      // Check H1 presence and uniqueness
      const h1Elements = await page.locator('h1').count();
      expect(h1Elements).toBe(1);

      // Check heading order
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      const headingLevels = await Promise.all(
        headings.map(async (heading) => {
          const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
          return parseInt(tagName.charAt(1));
        })
      );

      // Verify no heading levels are skipped
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
    });

    test('should have descriptive heading content', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      for (const heading of headings) {
        const content = await heading.textContent();
        expect(content).toBeTruthy();
        expect(content!.trim().length).toBeGreaterThan(2);
      }
    });
  });

  test.describe('Images Accessibility', () => {
    test('should have alt text for all images', async ({ page }) => {
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        
        // Images should have alt text unless they're decorative (role="presentation")
        if (role !== 'presentation') {
          expect(alt).toBeTruthy();
          expect(alt!.trim().length).toBeGreaterThan(0);
        }
      }
    });

    test('should have proper image loading attributes', async ({ page }) => {
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const loading = await img.getAttribute('loading');
        const src = await img.getAttribute('src');
        
        // Critical images should not have lazy loading
        if (src && !src.includes('hero') && !src.includes('above-fold')) {
          expect(loading).toBe('lazy');
        }
      }
    });
  });

  test.describe('Links Accessibility', () => {
    test('should have descriptive link text', async ({ page }) => {
      const links = await page.locator('a[href]').all();
      
      for (const link of links) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');
        
        // Links should have descriptive text, aria-label, or title
        const hasDescription = (text && text.trim().length > 0) || 
                             (ariaLabel && ariaLabel.trim().length > 0) || 
                             (title && title.trim().length > 0);
        
        expect(hasDescription).toBeTruthy();
        
        // Avoid generic link text
        if (text) {
          const genericTerms = ['click here', 'read more', 'more', 'here', 'link'];
          const isGeneric = genericTerms.some(term => 
            text.toLowerCase().trim() === term
          );
          expect(isGeneric).toBeFalsy();
        }
      }
    });

    test('should indicate external links', async ({ page }) => {
      const externalLinks = await page.locator('a[href^="http"]:not([href*="localhost"]):not([href*="127.0.0.1"])').all();
      
      for (const link of externalLinks) {
        const target = await link.getAttribute('target');
        const rel = await link.getAttribute('rel');
        const ariaLabel = await link.getAttribute('aria-label');
        const text = await link.textContent();
        
        // External links should open in new tab/window
        expect(target).toBe('_blank');
        
        // Should have security attributes
        expect(rel).toContain('noopener');
        
        // Should indicate they're external
        const indicatesExternal = (ariaLabel && ariaLabel.includes('external')) ||
                                 (text && (text.includes('(external)') || text.includes('↗')));
        
        if (!indicatesExternal) {
          // Should at least have an icon or visual indicator
          const hasIcon = await link.locator('svg, i, .icon').count() > 0;
          expect(hasIcon).toBeTruthy();
        }
      }
    });
  });

  test.describe('Form Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      const inputs = await page.locator('input, textarea, select').all();
      
      for (const input of inputs) {
        const type = await input.getAttribute('type');
        
        // Skip hidden inputs
        if (type === 'hidden') continue;
        
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');
        
        // Input should have a label, aria-label, or aria-labelledby
        const hasLabel = (id && await page.locator(`label[for="${id}"]`).count() > 0) ||
                        (ariaLabel && ariaLabel.trim().length > 0) ||
                        (ariaLabelledby && ariaLabelledby.trim().length > 0);
        
        expect(hasLabel).toBeTruthy();
        
        // Placeholder should not be the only form of labeling
        if (!hasLabel && placeholder) {
          expect(false).toBeTruthy(); // Should fail
        }
      }
    });

    test('should have proper error handling', async ({ page }) => {
      const forms = await page.locator('form').all();
      
      for (const form of forms) {
        const requiredInputs = await form.locator('input[required], textarea[required], select[required]').all();
        
        for (const input of requiredInputs) {
          const ariaRequired = await input.getAttribute('aria-required');
          const ariaInvalid = await input.getAttribute('aria-invalid');
          
          // Required inputs should have aria-required
          expect(ariaRequired).toBe('true');
          
          // Should handle aria-invalid for error states
          if (ariaInvalid === 'true') {
            const ariaDescribedby = await input.getAttribute('aria-describedby');
            expect(ariaDescribedby).toBeTruthy();
            
            // Should have corresponding error message
            const errorMessage = await page.locator(`#${ariaDescribedby}`).count();
            expect(errorMessage).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('should have sufficient color contrast', async ({ page }) => {
      // This is a basic check - in a real scenario, you'd use tools like axe-core
      const textElements = await page.locator('p, span, div, h1, h2, h3, h4, h5, h6, a, button, li').all();
      
      for (const element of textElements.slice(0, 10)) { // Test first 10 elements
        const text = await element.textContent();
        if (text && text.trim().length > 0) {
          const computedStyle = await element.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              color: style.color,
              backgroundColor: style.backgroundColor,
              fontSize: style.fontSize
            };
          });
          
          // Basic checks
          expect(computedStyle.color).not.toBe(computedStyle.backgroundColor);
          expect(computedStyle.color).not.toBe('rgba(0, 0, 0, 0)');
        }
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should be keyboard navigable', async ({ page }) => {
      const focusableElements = await page.locator(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      ).all();
      
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT']).toContain(firstFocused!);
    });

    test('should have visible focus indicators', async ({ page }) => {
      const focusableElements = await page.locator('button, a[href], input, textarea, select').first();
      
      await focusableElements.focus();
      
      const focusStyle = await focusableElements.evaluate(el => {
        const style = window.getComputedStyle(el, ':focus');
        return {
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          boxShadow: style.boxShadow
        };
      });
      
      // Should have some form of focus indicator
      const hasFocusIndicator = focusStyle.outline !== 'none' || 
                               focusStyle.outlineWidth !== '0px' ||
                               focusStyle.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBeTruthy();
    });
  });

  test.describe('ARIA Compliance', () => {
    test('should use ARIA landmarks properly', async ({ page }) => {
      // Check for main landmark
      const main = await page.locator('main, [role="main"]').count();
      expect(main).toBeGreaterThanOrEqual(1);
      
      // Check for navigation
      const nav = await page.locator('nav, [role="navigation"]').count();
      expect(nav).toBeGreaterThanOrEqual(0);
      
      // Check for contentinfo (footer)
      const footer = await page.locator('footer, [role="contentinfo"]').count();
      expect(footer).toBeGreaterThanOrEqual(0);
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      // Check buttons with only icons have aria-label
      const iconButtons = await page.locator('button').all();
      
      for (const button of iconButtons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const hasIcon = await button.locator('svg, i, .icon').count() > 0;
        
        if (hasIcon && (!text || text.trim().length === 0)) {
          expect(ariaLabel).toBeTruthy();
          expect(ariaLabel!.trim().length).toBeGreaterThan(0);
        }
      }
    });

    test('should handle dynamic content properly', async ({ page }) => {
      // Check for aria-live regions for dynamic content
      const liveRegions = await page.locator('[aria-live]').all();
      
      for (const region of liveRegions) {
        const ariaLive = await region.getAttribute('aria-live');
        expect(['polite', 'assertive', 'off']).toContain(ariaLive!);
      }
    });
  });

  test.describe('Language and Internationalization', () => {
    test('should have proper language attributes', async ({ page }) => {
      // Check html lang attribute
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBeTruthy();
      expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      
      // Check for lang changes in content
      const langElements = await page.locator('[lang]').all();
      
      for (const element of langElements) {
        const lang = await element.getAttribute('lang');
        expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      }
    });
  });

  test.describe('Performance Impact on SEO', () => {
    test('should have fast loading times', async ({ page }) => {
      const startTime = Date.now();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load in under 3 seconds for good SEO
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have optimized images', async ({ page }) => {
      const images = await page.locator('img').all();
      
      for (const img of images.slice(0, 5)) { // Test first 5 images
        const src = await img.getAttribute('src');
        if (src && !src.startsWith('data:')) {
          // Check if image has modern format or is optimized
          const isOptimized = src.includes('.webp') || 
                             src.includes('.avif') || 
                             src.includes('w_') || // Cloudinary width param
                             src.includes('resize') ||
                             src.includes('optimize');
          
          if (!isOptimized) {
            console.warn(`Image may not be optimized: ${src}`);
          }
        }
      }
    });
  });

  test.describe('Structured Data', () => {
    test('should have proper structured data', async ({ page }) => {
      const jsonLd = await page.locator('script[type="application/ld+json"]').count();
      
      if (jsonLd > 0) {
        const scripts = await page.locator('script[type="application/ld+json"]').all();
        
        for (const script of scripts) {
          const content = await script.textContent();
          expect(() => JSON.parse(content!)).not.toThrow();
          
          const data = JSON.parse(content!);
          expect(data['@context']).toBeTruthy();
          expect(data['@type']).toBeTruthy();
        }
      }
    });
  });
});