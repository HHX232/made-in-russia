describe('Favorites and card page is available', () => {
  const baseUrl = 'http://localhost:3000/ru'

  beforeEach(() => {
    cy.viewport(1500, 1000)
  })

  it('should manage multiple favorites correctly', () => {
    // 1. Посещаем главную страницу
    cy.visit(baseUrl, {
      timeout: 10000
    })

    // 2. Ждём загрузки каталога
    cy.get('#cy-cards-catalog', {timeout: 15000}).should('exist')
    cy.get('#cy-cards-catalog #cy-card').should('have.length.at.least', 3)

    // 3. Обрабатываем первые 3 карточки по одной
    for (let i = 0; i < 3; i++) {
      cy.log(`Processing card ${i}`)

      // Получаем карточку заново каждый раз
      cy.get('#cy-cards-catalog #cy-card').eq(i).as(`currentCard`)

      // Сохраняем заголовок карточки
      cy.get('@currentCard')
        .find('#cy-card-title')
        .invoke('text')
        .then((title) => {
          const cardTitle = title.trim()
          cy.wrap(cardTitle).as(`cardTitle${i}`)
          cy.log(`Saved card ${i} title: ${cardTitle}`)
        })

      // Проверяем и обрабатываем кнопку избранного
      cy.get('@currentCard')
        .find('#cy-toggle-favorites-button')
        .then(($btn) => {
          const initialActive = $btn.attr('data-active') === 'true'
          if (initialActive) {
            cy.log(`Card ${i} is already in favorites, removing first`)
            // Если уже в избранном, сначала убираем
            cy.get('@currentCard').find('#cy-toggle-favorites-button').click()
            // Ждем обновления DOM и проверяем состояние
            cy.get('#cy-cards-catalog #cy-card')
              .eq(i)
              .find('#cy-toggle-favorites-button')
              .should('have.attr', 'data-active', 'false')
          }
        })

      cy.get('#cy-cards-catalog #cy-card').eq(i).find('#cy-toggle-favorites-button').click()

      // Проверяем, что добавилось в избранное (получаем элемент заново)
      cy.get('#cy-cards-catalog #cy-card')
        .eq(i)
        .find('#cy-toggle-favorites-button')
        .should('have.attr', 'data-active', 'true')

      cy.log(`Card ${i} successfully added to favorites`)
    }

    cy.visit(`${baseUrl}/favorites`, {
      timeout: 15000,
      onBeforeLoad(win) {
        win.localStorage.setItem('authToken', window.localStorage.getItem('authToken')!)
      }
    })

    // 5. Проверяем, что все 3 карточки присутствуют в избранном
    cy.get('#cy-favorites-cards-catalog #cy-card', {timeout: 10000}).should('have.length.at.least', 3)

    // 6. Проверяем, что добавленные карточки присутствуют в избранном
    cy.get('@cardTitle0').then((cardTitle0) => {
      cy.get('#cy-favorites-cards-catalog #cy-card')
        .contains('#cy-card-title', cardTitle0 as unknown as string)
        .should('exist')
      cy.log(`Card 0 found in favorites: ${cardTitle0}`)
    })

    cy.get('@cardTitle1').then((cardTitle1) => {
      cy.get('#cy-favorites-cards-catalog #cy-card')
        .contains('#cy-card-title', cardTitle1 as unknown as string)
        .should('exist')
      cy.log(`Card 1 found in favorites: ${cardTitle1}`)
    })

    cy.get('@cardTitle2').then((cardTitle2) => {
      cy.get('#cy-favorites-cards-catalog #cy-card')
        .contains('#cy-card-title', cardTitle2 as unknown as string)
        .should('exist')
      cy.log(`Card 2 found in favorites: ${cardTitle2}`)
    })

    // 7. Удаляем вторую карточку (индекс 1) из избранного
    cy.get('@cardTitle1').then((cardTitle1) => {
      cy.log(`Removing card from favorites: ${cardTitle1}`)

      // Находим карточку для удаления
      cy.get('#cy-favorites-cards-catalog #cy-card')
        .contains('#cy-card-title', cardTitle1 as unknown as string)
        .parents('#cy-card')
        .find('#cy-toggle-favorites-button')
        .should('have.attr', 'data-active', 'true')
        .click()

      // 8. Проверяем, что удаленная карточка исчезла из избранного
      cy.get('#cy-favorites-cards-catalog').should('not.contain', cardTitle1 as unknown as string)
      cy.log(`Card successfully removed from favorites: ${cardTitle1}`)
    })

    // 9. Проверяем, что остальные две карточки все еще в избранном
    cy.get('@cardTitle0').then((cardTitle0) => {
      cy.get('#cy-favorites-cards-catalog #cy-card')
        .contains('#cy-card-title', cardTitle0 as unknown as string)
        .should('exist')
    })

    cy.get('@cardTitle2').then((cardTitle2) => {
      cy.get('#cy-favorites-cards-catalog #cy-card')
        .contains('#cy-card-title', cardTitle2 as unknown as string)
        .should('exist')
    })

    // 10. Возвращаемся на главную страницу
    cy.visit(baseUrl, {
      timeout: 10000,
      onBeforeLoad(win) {
        win.localStorage.setItem('authToken', window.localStorage.getItem('authToken')!)
      }
    })

    cy.get('#cy-cards-catalog', {timeout: 15000}).should('exist')

    // 11. Проверяем состояние кнопок избранного на главной странице
    // Первая карточка должна остаться в избранном
    cy.get('@cardTitle0').then((cardTitle0) => {
      cy.get('#cy-cards-catalog #cy-card')
        .contains('#cy-card-title', cardTitle0 as unknown as string)
        .parents('#cy-card')
        .find('#cy-toggle-favorites-button')
        .should('have.attr', 'data-active', 'true')
      cy.log(`Card 0 still in favorites on main page: ${cardTitle0}`)
    })

    // Вторая карточка должна быть удалена из избранного
    cy.get('@cardTitle1').then((cardTitle1) => {
      cy.get('#cy-cards-catalog #cy-card')
        .contains('#cy-card-title', cardTitle1 as unknown as string)
        .parents('#cy-card')
        .find('#cy-toggle-favorites-button')
        .should('have.attr', 'data-active', 'false')
      cy.log(`Card 1 removed from favorites on main page: ${cardTitle1}`)
    })

    // Третья карточка должна остаться в избранном
    cy.get('@cardTitle2').then((cardTitle2) => {
      cy.get('#cy-cards-catalog #cy-card')
        .contains('#cy-card-title', cardTitle2 as unknown as string)
        .parents('#cy-card')
        .find('#cy-toggle-favorites-button')
        .should('have.attr', 'data-active', 'true')
      cy.log(`Card 2 still in favorites on main page: ${cardTitle2}`)
    })

    cy.log('Test completed: 3 cards added to favorites, 1 removed, 2 remain in favorites')
  })
})
