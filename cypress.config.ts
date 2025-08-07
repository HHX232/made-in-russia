import {defineConfig} from 'cypress'
import cypressSplit from 'cypress-split'

export default defineConfig({
  projectId: 'jhaphr',
  e2e: {
    setupNodeEvents(on, config) {
      cypressSplit(on, config) // Добавляем поддержку параллельного выполнения

      // Дополнительные env-переменные
      config.env = {
        ...config.env,
        apiUrl: 'https://exporteru.com/api/v1',
        defaultEmail: 'uguan@mailto.plus',
        defaultPassword: '123123123'
      }

      return config
    },
    // Базовый URL для тестов
    baseUrl: 'http://localhost:3000/ru'
  },

  video: false,
  retries: {
    runMode: 1
  }
})
