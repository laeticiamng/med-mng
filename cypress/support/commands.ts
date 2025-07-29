// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom commands for MED-MNG platform
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('not.include', '/login')
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/login')
})

Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().its('document.readyState').should('equal', 'complete')
  cy.get('[data-testid="loading-spinner"]').should('not.exist')
})

Cypress.Commands.add('checkAccessibility', () => {
  // Basic accessibility checks
  cy.get('main').should('exist')
  cy.get('h1, h2, h3, h4, h5, h6').should('exist')
  
  // Check for proper button/link focus
  cy.get('button, a').each(($el) => {
    cy.wrap($el).focus().should('have.focus')
  })
  
  // Check for alt text on images
  cy.get('img').each(($img) => {
    cy.wrap($img).should('have.attr', 'alt')
  })
})
