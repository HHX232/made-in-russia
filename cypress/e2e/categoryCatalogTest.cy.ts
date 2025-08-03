describe('use category catalog', () => {
  const baseUrl = 'http://localhost:3000/ru'
  const urlOfForestCategory = 'http://localhost:3000/ru/categories/lesovodstvo-i-lesozagotovki/lesozagotovki'
  beforeEach(() => {
    cy.viewport(1500, 1000)
  })

  it('should open catalog end redirect to category page', () => {
    cy.visit(baseUrl, {timeout: 5000})
    cy.wait(500)
    cy.get('#cy-category-button', {timeout: 10000}).should('exist').click()
    cy.get('#cy-category-list-box', {timeout: 10000}).should('exist').should('be.visible').as('categoryListBox')
    cy.get('@categoryListBox').find('li').should('have.length.at.least', 1)
    cy.get('@categoryListBox').find('li').eq(1).find('a').should('exist').trigger('mouseover', {force: true})
    cy.get('#cy-subcategory-list-box', {timeout: 10000}).should('exist').as('subcategoryListBox')
    cy.get('@subcategoryListBox').find('li').should('have.length.at.least', 1)
    cy.wait(500)
    //  cy.get('#cy-subcategory-list-item').find('div').eq(0).should('exist').click()
    cy.get('#cy-subcategory-list-item')
      .find('div')
      .eq(0)
      .should('be.visible')
      .then(($categoryDiv) => {
        const selectedCategoryName = $categoryDiv.text().trim()

        // 7. Кликаем на категорию
        cy.wrap($categoryDiv).click()

        // 8. Проверяем, что URL изменился на страницу категорий
        cy.url({timeout: 10000}).should('include', '/categories')

        cy.get('#cy-category-page-title')
          .should('be.visible')
          .invoke('text')
          .then((pageTitle) => {
            const trimmedTitle = pageTitle.trim()

            expect(trimmedTitle).to.equal(selectedCategoryName)

            cy.wrap(trimmedTitle).should('match', /[А-Яа-яЁё]/)
          })
        cy.log('selectedCategoryName', selectedCategoryName)
      })
  })

  it('should verify the card belongs to the selected category', () => {
    // 1. Переходим на страницу категории и получаем её название
    cy.visit(urlOfForestCategory, {timeout: 10000})
    cy.wait(1500)

    let categoryPageTitle: string

    // Сохраняем название категории
    cy.get('#cy-category-page-title')
      .should('be.visible')
      .invoke('text')
      .then((title) => {
        categoryPageTitle = title.trim()
        cy.log(`Category title on page: "${categoryPageTitle}"`)
      })

    // 2. Кликаем на первую карточку
    cy.get('#cy-cards-catalog', {timeout: 15000}).should('exist').and('be.visible').find('#cy-card').first().click()

    // 3. Ждём загрузки страницы карточки и проверяем URL
    cy.wait(1500)
    cy.url()
      .should('include', '/card')
      .then((url) => {
        const productId = url.split('/card/')[1]
        cy.wrap(productId).should('be.a', 'string').and('not.be.empty')
        // 4. Запрашиваем данные карточки с API
        cy.request({
          method: 'GET',
          url: `http://181.215.18.219/api/v1/products/${productId}`,
          headers: {
            'Accept-language': 'ru',
            'x-language': 'ru'
          }
        }).then((response) => {
          // Проверка что API действительно вернул русскую локаль
          if (response.body.category?.name === 'Logging operations') {
            cy.log('Внимание! API вернул английское название, несмотря на русские заголовки')
          }
          expect(response.body.category?.name.toLowerCase()).to.equal(
            categoryPageTitle.toLowerCase(),
            `API category name (${response.body.category?.name}) should match the page title (${categoryPageTitle})`
          )
        })
      })
  })
})
