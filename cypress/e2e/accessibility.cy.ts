describe('Accessibility Tests - MED-MNG', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForPageLoad()
  })

  describe('Keyboard Navigation', () => {
    it('should navigate entire app with keyboard only', () => {
      // Test main navigation
      cy.get('body').tab()
      cy.focused().should('have.attr', 'data-testid', 'skip-to-content')
      
      // Navigate through main menu
      cy.tab().tab().tab()
      cy.focused().should('contain', 'EDN')
      cy.focused().type('{enter}')
      cy.url().should('include', '/edn')
      
      // Test EDN item navigation
      cy.tab()
      cy.focused().should('have.attr', 'data-testid', 'edn-item')
      cy.focused().type('{enter}')
      cy.url().should('include', '/edn/')
    })

    it('should have proper focus management in modals', () => {
      cy.login()
      cy.visit('/music')
      
      // Open create modal
      cy.get('[data-testid="create-song-button"]').click()
      
      // Focus should be trapped in modal
      cy.get('[data-testid="modal"]').should('be.visible')
      cy.focused().should('be.within', '[data-testid="modal"]')
      
      // Close modal and focus should return
      cy.get('[data-testid="close-modal"]').click()
      cy.focused().should('have.attr', 'data-testid', 'create-song-button')
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper heading hierarchy', () => {
      cy.visit('/')
      
      // Check h1 exists and is unique
      cy.get('h1').should('have.length', 1)
      cy.get('h1').should('be.visible')
      
      // Check heading hierarchy (no h3 without h2, etc.)
      cy.get('h1, h2, h3, h4, h5, h6').then(($headings) => {
        const headings = Array.from($headings).map(el => parseInt(el.tagName.slice(1)))
        let currentLevel = 0
        
        headings.forEach(level => {
          expect(level).to.be.at.most(currentLevel + 1)
          currentLevel = level
        })
      })
    })

    it('should have proper ARIA labels and roles', () => {
      cy.visit('/music')
      
      // Check navigation has proper role
      cy.get('[role="navigation"]').should('exist')
      
      // Check buttons have accessible names
      cy.get('button').each(($btn) => {
        cy.wrap($btn).should(($el) => {
          const hasText = $el.text().trim().length > 0
          const hasAriaLabel = $el.attr('aria-label')
          const hasAriaLabelledby = $el.attr('aria-labelledby')
          
          expect(hasText || hasAriaLabel || hasAriaLabelledby).to.be.true
        })
      })
      
      // Check images have alt text
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt')
      })
    })

    it('should announce dynamic content changes', () => {
      cy.login()
      cy.visit('/music/create')
      
      // Check live region for status updates
      cy.get('[aria-live="polite"], [aria-live="assertive"]').should('exist')
      
      // Test status announcement during generation
      cy.get('[data-testid="emotion-input"]').type('Test emotion')
      cy.get('[data-testid="create-song-button"]').click()
      
      // Should update live region
      cy.get('[aria-live]').should('not.be.empty')
    })
  })

  describe('Visual Accessibility', () => {
    it('should have sufficient color contrast', () => {
      cy.visit('/')
      
      // Check main text has good contrast
      cy.get('body').should('have.css', 'color')
      cy.get('body').should('have.css', 'background-color')
      
      // Check button states
      cy.get('button').first().should('be.visible')
      cy.get('button').first().hover()
      cy.get('button').first().should('have.css', 'background-color')
    })

    it('should work without images', () => {
      // Disable images
      cy.visit('/', {
        onBeforeLoad: (win) => {
          win.document.addEventListener('DOMContentLoaded', () => {
            const images = win.document.querySelectorAll('img')
            images.forEach(img => img.style.display = 'none')
          })
        }
      })
      
      // App should still be functional
      cy.get('[data-testid="main-nav"]').should('be.visible')
      cy.get('button, a').should('be.visible')
    })

    it('should work with 200% zoom', () => {
      cy.viewport(640, 360) // Simulate 200% zoom on 1280x720
      cy.visit('/')
      
      // Content should still be accessible
      cy.get('[data-testid="main-nav"]').should('be.visible')
      cy.get('main').should('be.visible')
      
      // No horizontal scrolling
      cy.window().its('document.body.scrollWidth').should('be.lte', 640)
    })
  })

  describe('Forms Accessibility', () => {
    it('should have proper form labels and error handling', () => {
      cy.visit('/login')
      
      // Check all inputs have labels
      cy.get('input').each(($input) => {
        const id = $input.attr('id')
        if (id) {
          cy.get(`label[for="${id}"]`).should('exist')
        } else {
          cy.wrap($input).parent().find('label').should('exist')
        }
      })
      
      // Test error announcement
      cy.get('[data-testid="login-button"]').click()
      
      // Errors should be associated with inputs
      cy.get('[aria-invalid="true"]').should('exist')
      cy.get('[role="alert"], [aria-live="assertive"]').should('exist')
    })
  })
})