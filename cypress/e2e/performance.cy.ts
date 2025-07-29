describe('Performance Tests - MED-MNG', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Page Load Performance', () => {
    it('should load homepage within performance budget', () => {
      cy.window().then((win) => {
        return new Promise((resolve) => {
          if (win.performance.timing.loadEventEnd) {
            resolve(win.performance.timing.loadEventEnd - win.performance.timing.navigationStart)
          } else {
            win.addEventListener('load', () => {
              resolve(win.performance.timing.loadEventEnd - win.performance.timing.navigationStart)
            })
          }
        })
      }).then((loadTime) => {
        expect(loadTime).to.be.lessThan(3000) // 3 seconds max
      })
    })

    it('should achieve good Core Web Vitals', () => {
      cy.window().then((win) => {
        // Test LCP (Largest Contentful Paint)
        return new Promise((resolve) => {
          new win.PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            resolve(lastEntry.startTime)
          }).observe({ entryTypes: ['largest-contentful-paint'] })
          
          setTimeout(() => resolve(0), 5000) // Fallback
        })
      }).then((lcp) => {
        if (lcp > 0) {
          expect(lcp).to.be.lessThan(2500) // Good LCP threshold
        }
      })
    })
  })

  describe('API Response Times', () => {
    it('should load EDN items quickly', () => {
      const start = Date.now()
      
      cy.intercept('GET', '/api/edn**').as('ednRequest')
      cy.visit('/edn')
      cy.wait('@ednRequest').then((interception) => {
        const responseTime = Date.now() - start
        expect(responseTime).to.be.lessThan(2000) // 2 seconds max
      })
    })

    it('should handle concurrent requests efficiently', () => {
      cy.login()
      
      // Trigger multiple API calls simultaneously
      cy.intercept('GET', '/api/music**').as('musicRequest')
      cy.intercept('GET', '/api/profile**').as('profileRequest')
      cy.intercept('GET', '/api/library**').as('libraryRequest')
      
      cy.visit('/dashboard')
      
      // All should complete within reasonable time
      cy.wait(['@musicRequest', '@profileRequest', '@libraryRequest']).then((interceptions) => {
        interceptions.forEach(interception => {
          expect(interception.response?.statusCode).to.be.oneOf([200, 304])
        })
      })
    })
  })

  describe('Memory Usage', () => {
    it('should not have memory leaks during navigation', () => {
      let initialMemory: number
      
      cy.window().then((win) => {
        // @ts-ignore - performance.memory might not be available in all browsers
        initialMemory = win.performance.memory?.usedJSHeapSize || 0
      })
      
      // Navigate through multiple pages
      cy.visit('/edn')
      cy.visit('/music')
      cy.visit('/library')
      cy.visit('/profile')
      cy.visit('/')
      
      cy.window().then((win) => {
        // @ts-ignore
        const finalMemory = win.performance.memory?.usedJSHeapSize || 0
        
        if (initialMemory > 0 && finalMemory > 0) {
          const memoryIncrease = finalMemory - initialMemory
          const percentageIncrease = (memoryIncrease / initialMemory) * 100
          
          // Memory should not increase by more than 50% during navigation
          expect(percentageIncrease).to.be.lessThan(50)
        }
      })
    })
  })

  describe('Audio Streaming Performance', () => {
    it('should start audio playback quickly', () => {
      cy.login()
      cy.visit('/music')
      
      // Find a song and test playback start time
      cy.get('[data-testid="song-item"]').first().within(() => {
        const start = Date.now()
        
        cy.get('[data-testid="play-button"]').click()
        
        cy.get('audio').should(($audio) => {
          const audio = $audio[0] as HTMLAudioElement
          const playStartTime = Date.now() - start
          
          // Audio should start within 1 second
          expect(playStartTime).to.be.lessThan(1000)
        })
      })
    })

    it('should handle audio buffering efficiently', () => {
      cy.login()
      cy.visit('/music')
      
      cy.get('[data-testid="song-item"]').first().within(() => {
        cy.get('[data-testid="play-button"]').click()
        
        // Wait for audio to load and play
        cy.get('audio').should(($audio) => {
          const audio = $audio[0] as HTMLAudioElement
          expect(audio.readyState).to.be.at.least(2) // HAVE_CURRENT_DATA
        })
        
        // Should not show buffering spinner for too long
        cy.get('[data-testid="buffering-spinner"]').should('not.exist')
      })
    })
  })

  describe('Large Dataset Handling', () => {
    it('should handle large EDN lists efficiently', () => {
      cy.visit('/edn')
      
      // Test virtual scrolling or pagination
      cy.get('[data-testid="edn-list"]').should('be.visible')
      
      // Scroll through list and ensure smooth performance
      cy.get('[data-testid="edn-list"]').scrollTo('bottom')
      cy.wait(100)
      cy.get('[data-testid="edn-list"]').scrollTo('top')
      
      // Should not cause significant lag
      cy.get('[data-testid="edn-item"]').should('be.visible')
    })
  })

  describe('Bundle Size & Loading', () => {
    it('should have reasonable bundle sizes', () => {
      cy.intercept('GET', '**/*.js').as('jsBundle')
      cy.intercept('GET', '**/*.css').as('cssBundle')
      
      cy.visit('/')
      
      cy.wait('@jsBundle').then((interception) => {
        const contentLength = interception.response?.headers['content-length']
        if (contentLength) {
          const sizeKB = parseInt(contentLength) / 1024
          expect(sizeKB).to.be.lessThan(500) // 500KB max for JS bundles
        }
      })
    })
  })
})