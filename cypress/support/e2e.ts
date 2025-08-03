// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
// cypress/support/e2e.js
Cypress.on('uncaught:exception', (err) => {
  // Игнорировать ошибки гидратации Next.js
  if (err.message.includes('Hydration') || err.message.includes('hydration')) {
    return false // возвращаем false чтобы Cypress игнорировал ошибку
  }
  // Для всех других ошибок тест упадёт
  return true
})
import './commands'
