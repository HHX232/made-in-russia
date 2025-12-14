describe('User login flow', () => {
  const baseUrl = 'http://localhost:3000/ru'
  const email = 'uguan@mailto.plus'
  const password = '123123123'

  beforeEach(() => {
    cy.viewport(1500, 1000)
  })

  it('should login user and redirect to profile', () => {
    // 1. Посещаем главную страницу
    cy.visit(baseUrl, {timeout: 10000})

    // 2. Находим и нажимаем на кнопку профиля
    cy.get('#cy-profile-button', {timeout: 10000}).should('exist').click()

    // 3. Проверяем, что попали на страницу логина
    cy.url().should('include', '/login', {timout: 10000})

    // 4. Заполняем форму логина
    cy.get('#cy-email-input', {timeout: 10000}).should('exist').type(email)
    cy.get('#cy-password-input', {timeout: 10000}).should('exist').type(password)

    // 5. Перехватываем запрос логина для получения токенов
    cy.intercept('POST', '**/api/v1/auth/login-with-email').as('loginRequest')

    // 6. Нажимаем кнопку входа
    cy.get('#cy-login-button').should('exist').click()

    // 7. Ждем успешный ответ и сохраняем токены
    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200)

      const {accessToken, refreshToken} = interception.response?.body

      // Сохраняем токены в localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', accessToken)
        win.localStorage.setItem('refreshToken', refreshToken)
      })

      // Логируем токены для отладки
      cy.log(`Access Token: ${accessToken}`)
      cy.log(`Refresh Token: ${refreshToken}`)
    })

    // 8. Проверяем, что вернулись на главную страницу
    cy.url({timeout: 10000}).should('eq', baseUrl)

    // 9. Ждем 2-3 секунды как требуется
    cy.wait(3000)

    // 10. Снова нажимаем на кнопку профиля
    cy.get('#cy-profile-button').should('exist').click()

    // 11. Проверяем, что роут стал /profile
    cy.url({timeout: 15000}).should('include', '/profile')

    cy.log('Login test completed successfully')
  })
})
