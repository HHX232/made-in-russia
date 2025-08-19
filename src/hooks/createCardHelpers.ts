/* eslint-disable @typescript-eslint/no-explicit-any */
import {ValidationErrors, CompanyDescriptionData} from '@/components/pages/CreateCard/CreateCard.types'
import ICardFull from '@/services/card/card.types'
import {Language} from '@/store/multilingualDescriptionsInCard/multiLanguageCardPriceDataSlice.types'
import {PriceItem} from '@/types/CreateCard.extended.types'

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
      if (!cardTitle.trim()) return 'Название товара обязательно для заполнения'
      if (cardTitle.trim().length < 3) return 'Название должно содержать минимум 3 символа'
      return ''

    case 'uploadedFiles':
      const totalImages = uploadedFiles.length + remainingInitialImages.length
      if (totalImages < 3) return `Необходимо минимум 3 изображения (текущее количество: ${totalImages})`
      return ''

    case 'pricesArray':
      if (pricesArray.length === 0) return 'Необходимо добавить хотя бы одну цену'
      const invalidPrices = pricesArray.filter((price) => !price.value || price.value <= 0)
      if (invalidPrices.length > 0) return 'Все цены должны быть больше нуля'
      return ''

    case 'description':
      const cleanDescription = description.replace('## Основное описание', '').trim()
      if (!cleanDescription) return 'Основное описание обязательно для заполнения'
      if (cleanDescription.length < 10) return 'Основное описание должно содержать минимум 10 символов'
      return ''

    case 'descriptionMatrix':
      const filledRows = descriptionMatrix.filter((row) => row.some((cell) => cell.trim()))
      if (filledRows.length === 0) return 'Необходимо заполнить хотя бы одну строку в таблице характеристик'
      return ''
    case 'faqMatrix':
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
export const initializeMultilingualData = (allLanguages: Language[], currentLang: string, initialData: ICardFull) => {
  return allLanguages.reduce<Record<string, Partial<ICardFull>>>(
    (acc, lang) => ({
      ...acc,
      [lang]: {
        title:
          lang === currentLang
            ? initialData?.title || ''
            : (initialData?.titleTranslations && initialData?.titleTranslations[lang]) || '',
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
          lang === currentLang
            ? initialData.mainDescription
            : (initialData?.mainDescriptionTranslations && initialData?.mainDescriptionTranslations[lang]) || '',
        furtherDescription:
          lang === currentLang
            ? initialData.furtherDescription
            : (initialData?.furtherDescriptionTranslations && initialData?.furtherDescriptionTranslations[lang]) || '',
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
export const setInitialStorageValue = ({
  setDescriptions,
  setCharacteristics,
  setDelivery,
  setPackaging,
  updatePriceInfo,
  initialData
}: {
  initialData?: ICardFull
  setDescriptions: (
    descriptions: Record<string, {description: string; additionalDescription: string; furtherDescription: string}>
  ) => void
  setCharacteristics: (characteristics: any) => void
  setDelivery: (delivery: any) => void
  setPackaging: (packaging: any) => void
  updatePriceInfo: (priceInfo: any) => void
}) => {
  setDescriptions({
    ru: {
      description: initialData?.mainDescriptionTranslations.ru || '',
      additionalDescription: initialData?.furtherDescriptionTranslations.ru || '',
      furtherDescription: initialData?.furtherDescriptionTranslations.ru || ''
    },
    en: {
      description: initialData?.mainDescriptionTranslations.en || '',
      additionalDescription: initialData?.furtherDescriptionTranslations.en || '',
      furtherDescription: initialData?.furtherDescriptionTranslations.en || ''
    },
    zh: {
      description: initialData?.mainDescriptionTranslations.zh || '',
      additionalDescription: initialData?.furtherDescriptionTranslations.zh || '',
      furtherDescription: initialData?.furtherDescriptionTranslations.zh || ''
    }
  })

  setCharacteristics({
    language: 'ru',
    characteristics:
      initialData?.characteristics.map((el) => ({
        title: el.nameTranslations.ru,
        characteristic: el.valueTranslations.ru
      })) || []
  })
  setCharacteristics({
    language: 'en',
    characteristics:
      initialData?.characteristics.map((el) => ({
        title: el.nameTranslations.en,
        characteristic: el.valueTranslations.en
      })) || []
  })
  setCharacteristics({
    language: 'zh',
    characteristics:
      initialData?.characteristics.map((el) => ({
        title: el.nameTranslations.zh,
        characteristic: el.valueTranslations.zh
      })) || []
  })

  setDelivery({
    language: 'ru',
    delivery:
      initialData?.deliveryMethodsDetails?.map((el) => ({
        title: el.nameTranslations.ru,
        daysDelivery: el.valueTranslations.ru
      })) || []
  })
  setDelivery({
    language: 'en',
    delivery:
      initialData?.deliveryMethodsDetails?.map((el) => ({
        title: el.nameTranslations.en,
        daysDelivery: el.valueTranslations.en
      })) || []
  })
  setDelivery({
    language: 'zh',
    delivery:
      initialData?.deliveryMethodsDetails?.map((el) => ({
        title: el.nameTranslations.zh,
        daysDelivery: el.valueTranslations.zh
      })) || []
  })

  setPackaging({
    language: 'ru',
    packaging:
      initialData?.packagingOptions?.map((el) => ({
        title: el.nameTranslations.ru || el.name,
        price: el.price.toString()
      })) || []
  })
  setPackaging({
    language: 'en',
    packaging:
      initialData?.packagingOptions?.map((el) => ({
        title: el.nameTranslations.en || el.name,
        price: el.price.toString()
      })) || []
  })
  setPackaging({
    language: 'zh',
    packaging:
      initialData?.packagingOptions?.map((el) => ({
        title: el.nameTranslations.zh || el.name,
        price: el.price.toString()
      })) || []
  })
  updatePriceInfo({
    language: 'ru',
    field: 'daysBeforeSale',
    value: initialData?.daysBeforeDiscountExpires.toString() || ''
  })
  updatePriceInfo({
    language: 'ru',
    field: 'minimalVolume',
    value: initialData?.minimumOrderQuantity?.toString() || ''
  })
  updatePriceInfo({
    language: 'en',
    field: 'daysBeforeSale',
    value: initialData?.daysBeforeDiscountExpires.toString() || ''
  })
  updatePriceInfo({
    language: 'en',
    field: 'minimalVolume',
    value: initialData?.minimumOrderQuantity?.toString() || ''
  })
  updatePriceInfo({
    language: 'zh',
    field: 'daysBeforeSale',
    value: initialData?.daysBeforeDiscountExpires.toString() || ''
  })
  updatePriceInfo({
    language: 'zh',
    field: 'minimalVolume',
    value: initialData?.minimumOrderQuantity?.toString() || ''
  })
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
