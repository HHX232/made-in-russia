/* eslint-disable @typescript-eslint/no-explicit-any */
import {ValidationErrors, CompanyDescriptionData} from '@/components/pages/CreateCard/CreateCard.types'
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

    case 'companyData':
      if (!companyData.topDescription.trim()) return 'Верхнее описание компании обязательно для заполнения'
      if (!companyData.bottomDescription.trim()) return 'Нижнее описание компании обязательно для заполнения'
      const companyImagesWithContent = companyData.images.filter((img) => img.image !== null)
      if (companyImagesWithContent.length === 0) return 'Необходимо загрузить хотя бы одно изображение компании'
      const imagesWithoutDescription = companyImagesWithContent.filter((img) => !img.description.trim())
      if (imagesWithoutDescription.length > 0) return 'У всех загруженных изображений должны быть описания'
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
export const initializeMultilingualData = (allLanguages: string[], currentLang: string, initialData: any, t: any) => {
  return allLanguages.reduce(
    (acc, lang) => ({
      ...acc,
      [lang]: {
        title: lang === currentLang ? initialData?.title || '' : `${initialData?.title || ''} ${lang}`,
        mainDescription: '',
        furtherDescription: initialData?.furtherDescription || `## ${t('alternativeAdditionalDescr')}`
        // ... остальные поля
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
