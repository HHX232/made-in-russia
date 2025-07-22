/* eslint-disable @typescript-eslint/no-explicit-any */
import {ValidationErrors, CompanyDescriptionData} from '@/components/pages/CreateCard/CreateCard.types'
import ICardFull from '@/services/card/card.types'
import {Language} from '@/store/multilingualDescriptionsInCard/multiLanguageCardPriceDataSlice.types'
import {PriceItem} from '@/types/CreateCard.extended.types'

// utils/createCardHelpers.ts
export const parseQuantityRange = (quantityStr: string): {from: number; to: number | null} => {
  const trimmed = quantityStr.trim()
  const separators = ['-', '–', '—', '––']
  let parts: string[] = []

  for (const separator of separators) {
    if (trimmed.includes(separator)) {
      parts = trimmed.split(separator).map((p) => p.trim())
      break
    }
  }

  if (parts.length === 2) {
    const from = parseInt(parts[0]) || 0
    const to = parseInt(parts[1]) || 0
    return {from, to}
  }

  const singleValue = parseInt(trimmed) || 0
  return {from: singleValue, to: null}
}

export const validateField = (
  fieldName: keyof ValidationErrors,
  cardTitle: string,
  uploadedFiles: File[],
  remainingInitialImages: string[],
  pricesArray: PriceItem[],
  description: string,
  descriptionMatrix: string[][],
  companyData: CompanyDescriptionData,
  faqMatrix: string[][]
): string => {
  switch (fieldName) {
    case 'cardTitle':
      const titleError = !cardTitle || cardTitle.trim().length === 0 ? 'Название товара обязательно для заполнения' : ''
      // console.log(
      //   `Title validation - input: "${cardTitle}", trimmed length: ${cardTitle?.trim()?.length || 0}, error: "${titleError}"`
      // )
      return titleError

    case 'uploadedFiles':
      const totalImages = (uploadedFiles?.length || 0) + (remainingInitialImages?.length || 0)
      const filesError = totalImages < 3 ? 'Минимум 3 изображения' + `, сейчас ${totalImages}/3` : ''
      // console.log(`Files validation result: "${filesError}", total: ${totalImages}`)
      return filesError

    case 'pricesArray':
      const pricesError = !pricesArray || pricesArray.length === 0 ? 'Добавьте хотя бы одну цену' : ''
      // console.log(`Prices validation result: "${pricesError}"`)
      return pricesError

    case 'description':
      const descError = !description || description.trim().length === 0 ? 'Описание обязательно' : ''
      // console.log(`Description validation result: "${descError}" with description "${description}"`)
      return descError

    case 'descriptionMatrix':
      const filledRows = descriptionMatrix.filter((row) => row.some((cell) => cell.trim()))
      const matrixError =
        filledRows.length === 0 ? 'Необходимо заполнить хотя бы одну строку в таблице характеристик' : ''
      // console.log(
      //   `Description matrix validation result: "${matrixError}" with description matrix "${descriptionMatrix}"`
      // )
      return matrixError

    case 'companyData':
      if (!companyData.topDescription.trim()) return 'Верхнее описание компании обязательно для заполнения'
      if (!companyData.bottomDescription.trim()) return 'Нижнее описание компании обязательно для заполнения'
      const companyImagesWithContent = companyData.images.filter((img) => img.image !== null)
      if (companyImagesWithContent.length === 0) return 'Необходимо загрузить хотя бы одно изображение компании'
      const imagesWithoutDescription = companyImagesWithContent.filter((img) => !img.description.trim())
      if (imagesWithoutDescription.length > 0) return 'У всех загруженных изображений должны быть описания'
      return ''

    case 'faqMatrix':
      // console.log('faqMatrix in valid', faqMatrix)
      const filledFaqRows = faqMatrix.filter((row) => row[0].trim() || row[1].trim())
      if (filledFaqRows.length === 0) return 'Необходимо добавить хотя бы один вопрос и ответ'
      const incompleteRows = filledFaqRows.filter(
        (row) => (row[0].trim() && !row[1].trim()) || (!row[0].trim() && row[1].trim())
      )
      if (incompleteRows.length > 0) return 'Каждый вопрос должен иметь ответ и наоборот'
      return ''

    default:
      return ''
  }
}

// Вспомогательные функции инициализации
export const initializeMultilingualData = (
  allLanguages: Language[],
  currentLang: string,
  initialData: ICardFull,
 
) => {
  return allLanguages.reduce<Record<string, Partial<ICardFull>>>(
    (acc, lang) => ({
      ...acc,
      [lang]: {
        title: lang === currentLang ? initialData?.title || '' : initialData.titleTranslations[lang],
        aboutVendor: initialData?.aboutVendor
          ? {
              mainDescription:
                lang === currentLang
                  ? initialData.aboutVendor.mainDescription || ''
                  : initialData.aboutVendor.mainDescriptionTranslations[lang],
              furtherDescription:
                lang === currentLang
                  ? initialData.aboutVendor.furtherDescription || ''
                  : initialData.aboutVendor.furtherDescriptionTranslations[lang],
              mainDescriptionTranslations: initialData.aboutVendor.mainDescriptionTranslations,
              furtherDescriptionTranslations: initialData.aboutVendor.furtherDescriptionTranslations,
              media: initialData.aboutVendor.media || []
            }
          : undefined,
        category: initialData?.category,
        characteristics:
          initialData?.characteristics?.map((characteristic) => ({
            ...characteristic,
            name: lang === currentLang ? characteristic.name : characteristic.nameTranslations[lang],
            value: lang === currentLang ? characteristic.value : characteristic.valueTranslations[lang],
            nameTranslations: characteristic.nameTranslations,
            valueTranslations: characteristic.valueTranslations
          })) || [],
        creationDate: initialData?.creationDate,
        deliveryMethods:
          initialData?.deliveryMethods?.map((method) => ({
            ...method,
            name: lang === currentLang ? method.name : `${method.name} ${lang}`
          })) || [],
        daysBeforeDiscountExpires: initialData?.daysBeforeDiscountExpires,
        deliveryMethod: initialData?.deliveryMethod
          ? {
              ...initialData.deliveryMethod,
              name:
                lang === currentLang
                  ? initialData.deliveryMethod.name || ''
                  : `${initialData.deliveryMethod.name || ''} ${lang}`
            }
          : undefined,
        deliveryMethodsDetails:
          initialData?.deliveryMethodsDetails?.map((detail) => ({
            ...detail,
            name: lang === currentLang ? detail.name : detail.nameTranslations[lang],
            value: lang === currentLang ? detail.value : detail.valueTranslations[lang],
            nameTranslations: detail.nameTranslations,
            valueTranslations: detail.valueTranslations
          })) || [],
        discount: initialData?.discount,
        discountedPrice: initialData?.discountedPrice,
        originalPrice: initialData?.originalPrice,
        mainDescription:
          lang === currentLang ? initialData.mainDescription : initialData.mainDescriptionTranslations[lang],
        furtherDescription:
          lang === currentLang ? initialData.furtherDescription : initialData.furtherDescriptionTranslations[lang],
        summaryDescription:
          lang === currentLang
            ? initialData?.summaryDescription || ''
            : `${initialData?.summaryDescription || ''} ${lang}`,
        primaryDescription:
          lang === currentLang
            ? initialData?.primaryDescription || ''
            : `${initialData?.primaryDescription || ''} ${lang}`,
        priceUnit: lang === currentLang ? initialData?.priceUnit || '' : `${initialData?.priceUnit || ''} ${lang}`,
        previewImageUrl: initialData?.previewImageUrl
      }
    }),
    {}
  )
}
export const initializeCompanyDataForOthers = (
  allLanguages: string[],
  currentLang: string,
  initialData: any,
  companyData: CompanyDescriptionData
) => {
  return allLanguages
    .filter((lang) => lang !== currentLang)
    .reduce(
      (acc, lang) => ({
        ...acc,
        [lang]: {
          topDescription: `${initialData?.aboutVendor?.mainDescription || ''} ${lang}`,
          images: companyData.images,
          bottomDescription: `${initialData?.aboutVendor?.furtherDescription || ''} ${lang}`
        }
      }),
      {}
    )
}

export const initializeFaqMatrixForOthers = (allLanguages: string[], currentLang: string, initialData: any) => {
  return allLanguages
    .filter((lang) => lang !== currentLang)
    .reduce(
      (acc, lang) => ({
        ...acc,
        [lang]: initialData?.faq.map((el: any) => [`${el.question} ${lang}`, `${el.answer} ${lang}`]) || [
          ['', ''],
          ['', ''],
          ['', ''],
          ['', ''],
          ['', '']
        ]
      }),
      {}
    )
}

export const initializeDescriptionMatrixForOthers = (allLanguages: string[], currentLang: string, initialData: any) => {
  return allLanguages
    .filter((lang) => lang !== currentLang)
    .reduce(
      (acc, lang) => ({
        ...acc,
        [lang]: initialData?.characteristics.map((el: any) => [`${el.name} ${lang}`, `${el.value} ${lang}`]) || []
      }),
      {}
    )
}
