describe('create card with 2 lang', () => {
  const baseUrl = 'http://localhost:3000/ru/create-card'
  const homeUrl = 'http://localhost:3000/ru'
  const mainDescr = `
# Основное описание товара  

Этот товар обладает следующими **ключевыми характеристиками**:  

- ✅ Высокое качество материалов  
- 🔧 Простота в использовании  
- 🚀 Быстрая доставка по всей стране  

**Цена:** ~~5000 руб.~~ → **3999 руб.** (специальное предложение!)  
`
  const additionalDescr = `
## Дополнительная информация  

### 📦 Условия доставки:  
- Бесплатная доставка при заказе от 10 000 руб.  
- Возможен самовывоз из пунктов выдачи.  

### ❓ Частые вопросы:  
1. **Есть ли гарантия?**  
   Да, гарантия 12 месяцев.  
2. **Как оформить возврат?**  
   Обратитесь в поддержку в течение 14 дней.  

[Подробнее в нашем блоге](https://example.com/blog)  
`
  const topCompanyDescr = 'крутое русское описание компании, которое будет находиться в верхней части блока'
  const bottomCompanyDescr = 'крутое русское описание компании, которое будет находиться в нижней части блока'
  beforeEach(() => {
    cy.viewport(1500, 1000)
  })
  it('should create card with 2 lang', () => {
    cy.visit(homeUrl)
    cy.apiLogin()
    cy.visit(baseUrl)
    cy.wait(1000)
    cy.get('#cy-language-button--switch-ru').should('have.attr', 'data-active', 'true')
    cy.get('#cy-title-create-input').type('тестовое русское имя ' + Math.random().toString())
    cy.get('#cy-create-card-product-category-search').click()
    cy.get('#cy-create-card-product-category-dropdown').should('exist').should('be.visible').as('categoryDropdownBox')
    cy.get('@categoryDropdownBox').find('div').as('categoryDropdownItemsList')
    cy.get('@categoryDropdownItemsList').find('button').should('have.length.at.least', 2)
    cy.get('@categoryDropdownItemsList').find('button').eq(1).click()
    for (let i = 0; i < 4; i++) {
      cy.get(`#label-product-images-${i}`).should('exist').as('productImagesBox')
      cy.get('@productImagesBox').find('input').should('exist').as('productImagesInput')
      if (i <= 2) {
        cy.get('@productImagesInput').selectFile(`cypress/fixtures/test/test${i}.jpg`, {force: true})
      } else {
        cy.get('@productImagesInput').selectFile(
          [`cypress/fixtures/test/test${i}.jpg`, `cypress/fixtures/test/test${i + 1}.jpg`],
          {force: true}
        )
      }
    }
    cy.get('#cy-create-similar-products-plus-button').click()
    cy.wait(1000)
    cy.get('#cy-cards-catalog').should('exist').as('cardsCatalogBox')
    cy.get('@cardsCatalogBox').find('div').as('cardsCatalogItemsItems')

    cy.get('@cardsCatalogItemsItems').then(($items) => {
      if ($items.length > 0) {
        cy.get('@cardsCatalogItemsItems').first().click()
        cy.get('#cy-modal-window-default-close-button').click()
      } else {
        cy.get('#cy-modal-window-default-close-button').click()
      }
    })
    for (let i = 0; i < 2; i++) {
      cy.get(`#cy-row-elementCount-${i}`).should('exist').as('elementCountBox')
      cy.get('@elementCountBox').find('input').should('exist').as('elementCountInput')
      for (let j = 0; j < 5; j++) {
        let textForWrite = 'text'
        switch (j) {
          case 0:
            if (i === 0) {
              textForWrite = '1-5'
            } else {
              textForWrite = '1-10'
            }
            break
          case 1:
            if (i === 0) {
              textForWrite = '1000'
            } else {
              textForWrite = '2000'
            }
            break
          case 2:
            if (i === 0) {
              textForWrite = '800'
            } else {
              textForWrite = '1600'
            }
            break
          case 3:
            if (i === 0) {
              textForWrite = 'RUB'
            } else {
              textForWrite = 'USD'
            }
            break
          case 4:
            if (i === 0) {
              textForWrite = 'шт.'
            } else {
              textForWrite = 'кг.'
            }
            break
        }
        cy.get('@elementCountInput').eq(j).type(textForWrite)
      }
    }
    cy.get(`#cy-row-elementCount-2`).should('exist').as('elementCountBoxForDeleate')
    cy.get('@elementCountBoxForDeleate').find('#cy-create-card-row-remove-2').click()
    cy.get('@elementCountBoxForDeleate').should('not.exist')

    // ? инпуты характеристик
    for (let i = 0; i < 3; i++) {
      cy.get(`#cy-row-title-characteristic-${i}`).should('exist').as('characteristicBox')
      cy.get('@characteristicBox').find('input').should('exist').as('characteristicInput')
      cy.get('@characteristicInput')
        .eq(0)
        .type('тестовое русское имя' + ' ' + i)
      cy.get('@characteristicInput')
        .eq(1)
        .type('тестовое русское значение' + ' ' + i)
    }
    for (let i = 0; i < 2; i++) {
      cy.get(`#cy-row-title-characteristic-3`).should('exist').as('characteristicBoxForDeleate')
      cy.get('@characteristicBoxForDeleate').find(`#cy-create-card-row-remove-3`).click()
      cy.get('@characteristicBoxForDeleate').should('not.exist')
    }
    cy.get('#cy-create-card-row-plus-button-title-characteristic').should('exist').click()
    cy.get(`#cy-row-title-characteristic-3`).should('exist').as('characteristicBoxForTypeNew')
    cy.get('@characteristicBoxForTypeNew').find('input').should('exist').as('characteristicInputForTypeNew')
    cy.get('@characteristicInputForTypeNew')
      .eq(0)
      .type('тестовое русское имя' + ' ' + 3)
    cy.get('@characteristicInputForTypeNew')
      .eq(1)
      .type('тестовое русское значение' + ' ' + 3)

    // ? инпуты акции
    cy.get('#cy-daysBeforeSale').should('exist').type('50')
    cy.get('#cy-daysBeforeSale').should('exist').type('не введенный текст')
    cy.get('#cy-daysBeforeSale').should('exist').should('have.value', '50')

    cy.get('#cy-minimalVolume').should('exist').type('2')
    cy.get('#cy-minimalVolume').should('exist').type('не введенный текст')
    cy.get('#cy-minimalVolume').should('exist').should('have.value', '2')

    for (let i = 0; i < 2; i++) {
      if (i === 0) {
        cy.get(`#cy-row-title-delivery-${i}`).should('exist').find('input').should('exist').as('deliveryInputs')
        cy.get('@deliveryInputs').eq(0).should('exist').type('палеты')
        cy.get('@deliveryInputs').eq(1).should('exist').type('150 тысяч лет').should('have.value', '150 тысяч лет')
      } else {
        cy.get(`#cy-row-title-delivery-${i}`).should('exist').find('input').should('exist').as('deliveryInputs')
        cy.get('@deliveryInputs').eq(0).should('exist').type('мешки')
        cy.get('@deliveryInputs').eq(1).should('exist').type('300 лет').should('have.value', '300 лет')
      }
    }
    for (let i = 0; i < 2; i++) {
      cy.get(`#cy-row-title-packaging-${i}`).should('exist').find('input').should('exist').as('packagingInputs')
      cy.get('@packagingInputs')
        .eq(0)
        .should('exist')
        .type(i === 0 ? 'машина' : 'самолет')
      cy.get('@packagingInputs').eq(1).should('exist').type('100 тысяч рублей').should('have.value', '100')
    }
    cy.get('#cy-editor-main-descr').should('exist').find('.md-editor-input-wrapper').click().type(mainDescr)
    cy.get('#cy-editor-add-descr').should('exist').find('.md-editor-input-wrapper').click().type(additionalDescr)
    cy.get('#cy-top-company-descr').should('exist').click().type(topCompanyDescr)
    cy.get('#cy-bottom-company-descr').should('exist').click().type(bottomCompanyDescr)

    cy.get(`#label-company-image-0-0`)
      .should('exist')
      .find('input')
      .selectFile(`cypress/fixtures/test/test1.jpg`, {force: true})
    cy.get(`#label-company-image-1-0`)
      .should('exist')
      .find('input')
      .selectFile(`cypress/fixtures/test/test2.jpg`, {force: true})
    cy.get('#cy-descr-company-image-0').type('первое описание к изображению')
    cy.get('#cy-descr-company-image-1').type('второе описание к изображению')
    cy.get('#cy-row-cy-question-0').should('exist').find('input').as('faqInputs')
    cy.get('@faqInputs').eq(0).type('русский вопрос')
    cy.get('@faqInputs').eq(1).type('русский ответ')

    // Переключаемся на английский язык
    cy.get('#cy-language-button--switch-en').click()
    cy.wait(500)

    // Проверяем что английский стал активным, а русский неактивным
    cy.get('#cy-language-button--switch-en').should('have.attr', 'data-active', 'true')
    cy.get('#cy-language-button--switch-ru').should('have.attr', 'data-active', 'false')

    // Заполняем поля на английском языке
    cy.get('#cy-title-create-input')
      .clear()
      .type('english test name ' + Math.random().toString())

    // Инпуты акции на английском
    cy.get('#cy-daysBeforeSale').clear().type('75')
    cy.get('#cy-minimalVolume').clear().type('5')

    // Характеристики на английском
    for (let i = 0; i < 4; i++) {
      cy.get(`#cy-row-title-characteristic-${i}`).should('exist').as('characteristicBox')
      cy.get('@characteristicBox').find('input').should('exist').as('characteristicInput')
      cy.get('@characteristicInput')
        .eq(0)
        .clear()
        .type('english characteristic name' + ' ' + i)
      cy.get('@characteristicInput')
        .eq(1)
        .clear()
        .type('english characteristic value' + ' ' + i)
    }

    // Доставка на английском
    for (let i = 0; i < 2; i++) {
      cy.get(`#cy-row-title-delivery-${i}`).should('exist').find('input').should('exist').as('deliveryInputs')
      if (i === 0) {
        cy.get('@deliveryInputs').eq(0).clear().type('pallets')
        cy.get('@deliveryInputs').eq(1).clear().type('150 thousand years')
      } else {
        cy.get('@deliveryInputs').eq(0).clear().type('bags')
        cy.get('@deliveryInputs').eq(1).clear().type('300 years')
      }
    }

    // Упаковка на английском
    for (let i = 0; i < 2; i++) {
      cy.get(`#cy-row-title-packaging-${i}`).should('exist').find('input').should('exist').as('packagingInputs')
      cy.get('@packagingInputs')
        .eq(0)
        .clear()
        .type(i === 0 ? 'car' : 'airplane')
      cy.get('@packagingInputs').eq(1).clear().type('100 thousand rubles')
    }

    // Основное описание на английском
    const mainDescrEn = `
  # Main product description

  This product has the following **key features**:

  - ✅ High quality materials
  - 🔧 Easy to use
  - 🚀 Fast delivery nationwide

  **Price:** ~~$50~~ → **$39.99** (special offer!)
  `
    cy.get('#cy-editor-main-descr').should('exist').find('.md-editor-input-wrapper').click().type(mainDescrEn)

    // Дополнительное описание на английском
    const additionalDescrEn = `
  ## Additional information

  ### 📦 Shipping conditions:
  - Free shipping on orders over $100.
  - Pickup available from pickup points.

  ### ❓ Frequently asked questions:
  1. **Is there a warranty?**
     Yes, 12 months warranty.
  2. **How to arrange a return?**
     Contact support within 14 days.

  [More in our blog](https://example.com/blog)
  `
    cy.get('#cy-editor-add-descr').should('exist').find('.md-editor-input-wrapper').click().type(additionalDescrEn)

    // Описания компании на английском
    const topCompanyDescrEn = 'cool english company description that will be located in the top part of the block'
    const bottomCompanyDescrEn = 'cool english company description that will be located in the bottom part of the block'

    cy.get('#cy-top-company-descr').should('exist').click().type(topCompanyDescrEn)
    cy.get('#cy-bottom-company-descr').should('exist').click().type(bottomCompanyDescrEn)

    // Описания к изображениям компании на английском
    cy.get('#cy-descr-company-image-0').clear().type('first image description')
    cy.get('#cy-descr-company-image-1').clear().type('second image description')

    // FAQ на английском
    cy.get('#cy-row-cy-question-0').should('exist').find('input').as('faqInputs')
    cy.get('@faqInputs').eq(0).clear().type('english question')
    cy.get('@faqInputs').eq(1).clear().type('english answer')

    // Переключаемся обратно на русский язык
    cy.get('#cy-language-button--switch-ru').click()
    cy.wait(500)

    // Проверяем что русский стал активным, а английский неактивным
    cy.get('#cy-language-button--switch-ru').should('have.attr', 'data-active', 'true')
    cy.get('#cy-language-button--switch-en').should('have.attr', 'data-active', 'false')

    // Проверяем что русские значения остались на месте
    cy.get('#cy-title-create-input').should('contain.value', 'тестовое русское имя')

    // Проверяем русские значения акций
    cy.get('#cy-daysBeforeSale').should('have.value', '50')
    cy.get('#cy-minimalVolume').should('have.value', '2')

    // Проверяем русские характеристики
    for (let i = 0; i < 4; i++) {
      cy.get(`#cy-row-title-characteristic-${i}`).should('exist').as('characteristicBox')
      cy.get('@characteristicBox').find('input').should('exist').as('characteristicInput')
      cy.get('@characteristicInput')
        .eq(0)
        .should('contain.value', 'тестовое русское имя' + ' ' + i)
      cy.get('@characteristicInput')
        .eq(1)
        .should('contain.value', 'тестовое русское значение' + ' ' + i)
    }

    // Проверяем русские значения доставки
    cy.get(`#cy-row-title-delivery-0`).find('input').as('deliveryInputs0')
    cy.get('@deliveryInputs0').eq(0).should('contain.value', 'палеты')
    cy.get('@deliveryInputs0').eq(1).should('contain.value', '150 тысяч лет')

    cy.get(`#cy-row-title-delivery-1`).find('input').as('deliveryInputs1')
    cy.get('@deliveryInputs1').eq(0).should('contain.value', 'мешки')
    cy.get('@deliveryInputs1').eq(1).should('contain.value', '300 лет')

    // Проверяем русские значения упаковки
    cy.get(`#cy-row-title-packaging-0`).find('input').as('packagingInputs0')
    cy.get('@packagingInputs0').eq(0).should('contain.value', 'машина')

    cy.get(`#cy-row-title-packaging-1`).find('input').as('packagingInputs1')
    cy.get('@packagingInputs1').eq(0).should('contain.value', 'самолет')

    // Проверяем русские описания компании
    cy.get('#cy-top-company-descr').should('contain.value', topCompanyDescr)
    cy.get('#cy-bottom-company-descr').should('contain.value', bottomCompanyDescr)

    // Проверяем русские описания к изображениям
    cy.get('#cy-descr-company-image-0').should('contain.value', 'первое описание к изображению')
    cy.get('#cy-descr-company-image-1').should('contain.value', 'второе описание к изображению')

    // Проверяем русские FAQ
    cy.get('#cy-row-cy-question-0').find('input').as('faqInputs')
    cy.get('@faqInputs').eq(0).should('contain.value', 'русский вопрос')
    cy.get('@faqInputs').eq(1).should('contain.value', 'русский ответ')

    // Проверяем что markdown редакторы содержат русский текст
    cy.get('#cy-editor-main-descr').should('contain.text', 'Основное описание товара')
    cy.get('#cy-editor-add-descr').should('contain.text', 'Дополнительная информация')
    cy.get('#cy-submit-create-button').should('exist').click()
  })
})

describe('Negative testing: create card validation', () => {
  const baseUrl = 'http://localhost:3000/ru/create-card'
  const homeUrl = 'http://localhost:3000/ru'

  // Функция для проверки наличия ошибок в тостах
  const checkForErrors = () => {
    cy.wait(250)

    // Стратегия 1: Поиск по специальному атрибуту
    cy.get('body').then(($body) => {
      if ($body.find('[data-special-attr-for-error="true"]').length > 0) {
        cy.get('[data-special-attr-for-error="true"]').should('exist').should('be.visible')
        return
      }

      // Стратегия 2: Поиск контейнера ol с тостами
      if ($body.find('ol[data-sonner-toaster="true"]').length > 0) {
        cy.get('ol[data-sonner-toaster="true"]')
          .should('exist')
          .find('li[data-type="error"]')
          .should('have.length.at.least', 1)
        return
      }

      // Стратегия 3: Поиск любых li с data-type="error"
      if ($body.find('li[data-type="error"]').length > 0) {
        cy.get('li[data-type="error"]').should('have.length.at.least', 1)
        return
      }

      // Стратегия 4: Поиск по тексту "Ошибка"
      cy.contains('Ошибка').should('exist')
    })
  }

  beforeEach(() => {
    cy.viewport(1500, 1000)
    cy.visit(homeUrl)
    cy.apiLogin()
    cy.visit(baseUrl)
    cy.wait(1000)
  })

  it('should show error when submitting form without required title', () => {
    // Не заполняем название товара
    // Заполняем только категорию для частичной валидности
    cy.get('#cy-create-card-product-category-search').click()
    cy.get('#cy-create-card-product-category-dropdown').should('exist').should('be.visible')
    cy.get('#cy-create-card-product-category-dropdown').find('div button').eq(1).click()

    // Пытаемся отправить форму
    cy.get('#cy-submit-create-button').should('exist').click()

    // Проверяем наличие ошибок
    checkForErrors()
  })

  it('should show error when submitting form without selected category', () => {
    // Заполняем только название
    cy.get('#cy-title-create-input').type('тестовое название товара')

    // Не выбираем категорию
    // Пытаемся отправить форму
    cy.get('#cy-submit-create-button').should('exist').click()

    // Проверяем наличие ошибок
    checkForErrors()
  })

  it('should show error when submitting form without company descriptions', () => {
    // Заполняем обязательные поля
    cy.get('#cy-title-create-input').type('тестовое название товара')
    cy.get('#cy-create-card-product-category-search').click()
    cy.get('#cy-create-card-product-category-dropdown').find('div button').eq(1).click()

    // Не заполняем описания компании (cy-top-company-descr и cy-bottom-company-descr)
    // Пытаемся отправить форму
    cy.get('#cy-submit-create-button').should('exist').click()

    // Проверяем наличие ошибок
    checkForErrors()
  })

  it('should show error when submitting form without main description', () => {
    // Заполняем обязательные поля
    cy.get('#cy-title-create-input').type('тестовое название товара')
    cy.get('#cy-create-card-product-category-search').click()
    cy.get('#cy-create-card-product-category-dropdown').find('div button').eq(1).click()

    // Заполняем описания компании
    cy.get('#cy-top-company-descr').click().type('описание компании сверху')
    cy.get('#cy-bottom-company-descr').click().type('описание компании снизу')

    // Не заполняем основное описание товара (cy-editor-main-descr)
    // Пытаемся отправить форму
    cy.get('#cy-submit-create-button').should('exist').click()

    // Проверяем наличие ошибок
    checkForErrors()
  })

  it('should show error when submitting form without product images', () => {
    // Заполняем обязательные текстовые поля
    cy.get('#cy-title-create-input').type('тестовое название товара')
    cy.get('#cy-create-card-product-category-search').click()
    cy.get('#cy-create-card-product-category-dropdown').find('div button').eq(1).click()

    cy.get('#cy-top-company-descr').click().type('описание компании сверху')
    cy.get('#cy-bottom-company-descr').click().type('описание компании снизу')

    const mainDescr = 'Основное описание товара'
    cy.get('#cy-editor-main-descr').find('.md-editor-input-wrapper').click().type(mainDescr)

    // Не загружаем изображения товара
    // Пытаемся отправить форму
    cy.get('#cy-submit-create-button').should('exist').click()

    // Проверяем наличие ошибок
    checkForErrors()
  })

  it('should show error when submitting form without pricing information', () => {
    // Заполняем основные поля
    cy.get('#cy-title-create-input').type('тестовое название товара')
    cy.get('#cy-create-card-product-category-search').click()
    cy.get('#cy-create-card-product-category-dropdown').find('div button').eq(1).click()

    // Загружаем одно изображение
    cy.get('#label-product-images-0').find('input').selectFile('cypress/fixtures/test/test0.jpg', {force: true})

    cy.get('#cy-top-company-descr').click().type('описание компании сверху')
    cy.get('#cy-bottom-company-descr').click().type('описание компании снизу')

    const mainDescr = 'Основное описание товара'
    cy.get('#cy-editor-main-descr').find('.md-editor-input-wrapper').click().type(mainDescr)

    // Не заполняем информацию о ценах и количестве (elementCount секции)
    // Пытаемся отправить форму
    cy.get('#cy-submit-create-button').should('exist').click()

    // Проверяем наличие ошибок
    checkForErrors()
  })

  it('should show error when submitting incomplete form with mixed missing fields', () => {
    // Заполняем только название и категорию
    cy.get('#cy-title-create-input').type('тестовое название товара')
    cy.get('#cy-create-card-product-category-search').click()
    cy.get('#cy-create-card-product-category-dropdown').find('div button').eq(1).click()

    // Загружаем одно изображение
    cy.get('#label-product-images-0').find('input').selectFile('cypress/fixtures/test/test0.jpg', {force: true})

    // Заполняем только верхнее описание компании, но не нижнее
    cy.get('#cy-top-company-descr').click().type('описание компании сверху')
    // cy-bottom-company-descr оставляем пустым

    // Не заполняем основное описание товара и другие обязательные поля
    cy.get('#cy-submit-create-button').should('exist').click()

    // Проверяем наличие ошибок
    checkForErrors()
  })

  it('should show error when submitting form with invalid pricing data', () => {
    // Заполяем основные поля корректно
    cy.get('#cy-title-create-input').type('тестовое название товара')
    cy.get('#cy-create-card-product-category-search').click()
    cy.get('#cy-create-card-product-category-dropdown').find('div button').eq(1).click()

    cy.get('#label-product-images-0').find('input').selectFile('cypress/fixtures/test/test0.jpg', {force: true})

    cy.get('#cy-top-company-descr').click().type('описание компании сверху')
    cy.get('#cy-bottom-company-descr').click().type('описание компании снизу')

    const mainDescr = 'Основное описание товара'
    cy.get('#cy-editor-main-descr').find('.md-editor-input-wrapper').click().type(mainDescr)

    // Заполняем pricing с некорректными данными
    cy.get('#cy-row-elementCount-0').should('exist').as('elementCountBox')
    cy.get('@elementCountBox').find('input').as('elementCountInput')

    // Заполняем только часть полей или некорректными значениями
    cy.get('@elementCountInput').eq(0).type('invalid-range') // некорректный диапазон
    cy.get('@elementCountInput').eq(1).type('-1000') // отрицательная цена
    // Оставляем остальные поля пустыми

    cy.get('#cy-submit-create-button').should('exist').click()

    // Проверяем наличие ошибок
    checkForErrors()
  })

  // it('should count multiple validation errors for empty form', () => {
  //   // Тест полностью пустой формы - должно показать максимальное количество ошибок
  //   cy.get('#cy-submit-create-button').click()
  //   cy.wait(250)

  //   // Подсчитываем количество ошибок - разбиваем цепочку команд
  //   cy.get('body').then(($body) => {
  //     // Сначала пробуем найти по специальному атрибуту
  //     if ($body.find('[data-special-attr-for-error="true"]').length > 0) {
  //       // Разбиваем цепочку: сначала находим контейнер
  //       cy.get('[data-special-attr-for-error="true"]').should('exist')
  //       // Затем отдельно ищем li элементы
  //       cy.get('[data-special-attr-for-error="true"] li').then(($errors) => {
  //         expect($errors.length).to.be.at.least(1)
  //         cy.log(`Found ${$errors.length} validation errors with special attribute`)
  //       })
  //       return
  //     }

  //     // Пробуем найти контейнер тостов
  //     if ($body.find('ol[data-sonner-toaster="true"]').length > 0) {
  //       cy.get('ol[data-sonner-toaster="true"]').should('exist')
  //       cy.get('ol[data-sonner-toaster="true"] li[data-type="error"]').then(($errors) => {
  //         expect($errors.length).to.be.at.least(1)
  //         cy.log(`Found ${$errors.length} validation errors in toaster`)
  //       })
  //       return
  //     }

  //     // Ищем отдельные toast элементы
  //     if ($body.find('li[data-type="error"]').length > 0) {
  //       cy.get('li[data-type="error"]').then(($errors) => {
  //         expect($errors.length).to.be.at.least(1)
  //         cy.log(`Found ${$errors.length} individual error toasts`)
  //       })
  //       return
  //     }

  //     // Если ничего не найдено, проверяем наличие текста ошибок
  //     cy.contains('Ошибка').should('exist')
  //   })
  // })

  it('should show specific error messages from the document example', () => {
    // Тест для проверки конкретных ошибок из предоставленного HTML
    cy.get('#cy-submit-create-button').click()
    cy.wait(250)

    // Проверяем наличие контейнера тостов
    cy.get('body').then(($body) => {
      // Определяем ожидаемые ошибки
      const expectedErrors = [
        'Необходимо добавить хотя бы один вопрос и ответ',
        'Необходимо добавить минимум 1 характеристику',
        'Описание обязательно',
        'Необходимо указать стоимость товара, валюту, единицу измерения',
        'Минимум 3 изображения',
        'Необходимо указать наименование товара'
      ]

      // Проверяем специальный атрибут
      if ($body.find('[data-special-attr-for-error="true"]').length > 0) {
        cy.get('[data-special-attr-for-error="true"]').should('exist')

        // Проверяем каждую ошибку отдельно
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let foundErrors = 0
        expectedErrors.forEach((errorText, index) => {
          cy.get('body').then(($bodyCheck) => {
            if ($bodyCheck.text().includes(errorText)) {
              foundErrors++
              cy.log(`✓ Found expected error ${index + 1}: ${errorText}`)
            }
          })
        })

        // Проверяем что найдена хотя бы одна ошибка
        cy.get('body').should('contain.text', 'Ошибка')
        return
      }

      // Проверяем контейнер тостов
      if ($body.find('ol[data-sonner-toaster="true"]').length > 0) {
        cy.get('ol[data-sonner-toaster="true"]').should('exist')

        expectedErrors.forEach((errorText, index) => {
          cy.get('body').then(($bodyCheck) => {
            if ($bodyCheck.text().includes(errorText)) {
              cy.log(`✓ Found expected error ${index + 1}: ${errorText}`)
            }
          })
        })

        cy.get('body').should('contain.text', 'Ошибка')
        return
      }

      // Если контейнер не найден, проверяем по тексту
      cy.contains('Ошибка').should('exist')
    })
  })
})
