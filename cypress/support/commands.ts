/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

/// <reference types="cypress" />

function apiLogin(email: string = 'uguan@mailto.plus', password: string = '123123123') {
  const authUrl = `${Cypress.env('apiUrl')}/auth/login-with-email`

  return cy
    .request({
      method: 'POST',
      url: authUrl,
      body: {email, password},
      headers: {
        'Accept-Language': 'ru',
        'Content-Type': 'application/json'
      }
    })
    .then((response) => {
      if (response.status !== 200) {
        throw new Error(`Login failed with status ${response.status}`)
      }

      const {accessToken, refreshToken} = response.body
      cy.log('access', accessToken, 'refresh', refreshToken)
      // Return the cy.window() chain to maintain async flow
      return cy.window().then((win) => {
        win.document.cookie = `accessToken=${accessToken}`
        win.document.cookie = `refreshToken=${refreshToken}`

        // Return the tokens from within the cy.window().then()
        return {accessToken, refreshToken}
      })
    })
}

Cypress.Commands.add('apiLogin', apiLogin)

// Type declarations
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      apiLogin(
        email?: string,
        password?: string
      ): Chainable<{
        accessToken: string
        refreshToken: string
      }>
    }
  }
}

export {}
