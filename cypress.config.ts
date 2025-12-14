import {defineConfig} from 'cypress'
import cypressSplit from 'cypress-split'

export default defineConfig({
  projectId: 'jhaphr',
  e2e: {
    setupNodeEvents(on, config) {
      cypressSplit(on, config)

      config.env = {
        ...config.env,
        apiUrl: 'https://exporteru.com/api/v1',
        defaultEmail: 'uguan@mailto.plus',
        defaultPassword: '123123123'
      }

      return config
    },
    baseUrl: 'http://localhost:3000'
  },

  video: false,
  retries: {
    runMode: 1
  }
})
// npx cypress run --spec "cypress/e2e/**/*.cy.ts"
