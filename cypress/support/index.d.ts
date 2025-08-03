/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Выполняет вход через API и сохраняет токены в localStorage
       * @param email - Email пользователя (по умолчанию: uguan@mailto.plus)
       * @param password - Пароль пользователя (по умолчанию: 123123123)
       * @returns Chainable с объектом, содержащим accessToken и refreshToken
       */
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
