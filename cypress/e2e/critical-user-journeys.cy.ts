describe('Critical User Journeys - MED-MNG', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForPageLoad()
  })

  describe('Authentication Flow', () => {
    it('should complete signup/login flow', () => {
      // Test signup
      cy.visit('/signup')
      cy.get('[data-testid="email-input"]').type('newuser@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="signup-button"]').click()
      
      // Should redirect to dashboard or verification
      cy.url().should('not.include', '/signup')
      
      // Test logout
      cy.logout()
      
      // Test login
      cy.login('newuser@example.com', 'password123')
    })

    it('should handle authentication errors gracefully', () => {
      cy.visit('/login')
      cy.get('[data-testid="email-input"]').type('invalid@example.com')
      cy.get('[data-testid="password-input"]').type('wrongpassword')
      cy.get('[data-testid="login-button"]').click()
      
      // Should show error message
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid')
    })
  })

  describe('EDN Items Browse & View', () => {
    it('should browse and view EDN items', () => {
      cy.visit('/edn')
      cy.waitForPageLoad()
      
      // Should show EDN items list
      cy.get('[data-testid="edn-item"]').should('have.length.greaterThan', 0)
      
      // Click on first item
      cy.get('[data-testid="edn-item"]').first().click()
      
      // Should navigate to item detail
      cy.url().should('include', '/edn/')
      cy.get('[data-testid="edn-title"]').should('be.visible')
      cy.get('[data-testid="edn-content"]').should('be.visible')
    })

    it('should handle missing EDN items', () => {
      cy.visit('/edn/nonexistent-item')
      
      // Should show 404 or error message
      cy.get('[data-testid="error-message"], [data-testid="not-found"]').should('be.visible')
    })
  })

  describe('Music Generation & Streaming', () => {
    beforeEach(() => {
      cy.login()
    })

    it('should create and stream a song', () => {
      cy.visit('/music/create')
      cy.waitForPageLoad()
      
      // Fill song creation form
      cy.get('[data-testid="emotion-input"]').type('Happy and energetic')
      cy.get('[data-testid="style-select"]').select('pop')
      cy.get('[data-testid="create-song-button"]').click()
      
      // Should show generation progress
      cy.get('[data-testid="generation-progress"]').should('be.visible')
      
      // Wait for generation to complete (with timeout)
      cy.get('[data-testid="song-player"]', { timeout: 60000 }).should('be.visible')
      
      // Test audio streaming
      cy.get('[data-testid="play-button"]').click()
      cy.get('[data-testid="audio-player"]').should('have.prop', 'paused', false)
    })

    it('should handle music generation failures', () => {
      cy.visit('/music/create')
      
      // Try to create without required fields
      cy.get('[data-testid="create-song-button"]').click()
      
      // Should show validation errors
      cy.get('[data-testid="validation-error"]').should('be.visible')
    })
  })

  describe('Library Management', () => {
    beforeEach(() => {
      cy.login()
    })

    it('should add and remove songs from library', () => {
      cy.visit('/music')
      cy.waitForPageLoad()
      
      // Find a song and add to library
      cy.get('[data-testid="song-item"]').first().within(() => {
        cy.get('[data-testid="add-to-library"]').click()
      })
      
      // Should show success message
      cy.get('[data-testid="success-message"]').should('contain', 'Added to library')
      
      // Navigate to library
      cy.visit('/library')
      cy.get('[data-testid="library-song"]').should('have.length.greaterThan', 0)
      
      // Remove from library
      cy.get('[data-testid="library-song"]').first().within(() => {
        cy.get('[data-testid="remove-from-library"]').click()
      })
      
      // Should show removal confirmation
      cy.get('[data-testid="success-message"]').should('contain', 'Removed from library')
    })
  })

  describe('Error Handling & Edge Cases', () => {
    it('should handle network errors gracefully', () => {
      // Simulate network failure
      cy.intercept('GET', '/api/**', { forceNetworkError: true }).as('networkError')
      
      cy.visit('/music')
      cy.wait('@networkError')
      
      // Should show error message, not infinite spinner
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="retry-button"]').should('be.visible')
    })

    it('should handle API quota exceeded', () => {
      // Mock quota exceeded response
      cy.intercept('POST', '/api/music/generate', {
        statusCode: 429,
        body: { error: 'Quota exceeded' }
      }).as('quotaExceeded')
      
      cy.login()
      cy.visit('/music/create')
      cy.get('[data-testid="emotion-input"]').type('Test')
      cy.get('[data-testid="create-song-button"]').click()
      
      cy.wait('@quotaExceeded')
      cy.get('[data-testid="error-message"]').should('contain', 'quota')
    })
  })

  describe('Responsive & Mobile', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x')
      cy.visit('/')
      
      // Check mobile navigation
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible')
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="mobile-menu"]').should('be.visible')
      
      // Test main navigation on mobile
      cy.get('[data-testid="nav-edn"]').click()
      cy.url().should('include', '/edn')
    })

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2')
      cy.visit('/')
      
      // Should maintain functionality on tablet
      cy.get('[data-testid="main-nav"]').should('be.visible')
      cy.get('[data-testid="edn-grid"]').should('be.visible')
    })
  })
})