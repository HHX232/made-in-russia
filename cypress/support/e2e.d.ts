// e2e.d.ts
/// <reference types="cypress" />

declare global {
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
