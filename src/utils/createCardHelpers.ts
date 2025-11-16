/* eslint-disable @typescript-eslint/no-explicit-any */
import {ValidationErrors} from '@/components/pages/CreateCard/CreateCard.types'
import {getAccessToken} from '@/services/auth/auth.helper'
import ICardFull, {ICategory} from '@/services/card/card.types'
import {Product} from '@/services/products/product.types'
import {
  CardPriceElementsData,
  Language
} from '@/store/multilingualDescriptionsInCard/multiLanguageCardPriceDataSlice.types'
import {PriceItem} from '@/types/CreateCard.extended.types'
import {toast} from 'sonner'

// utils/createCardHelpers.ts
export const parseQuantityRange = (quantityStr: string): {from: number; to: number | null} => {
  const trimmed = quantityStr?.trim()
  const separators = ['-', '–', '—', '––']
  let parts: string[] = []

  for (const separator of separators) {
    if (trimmed?.includes(separator)) {
      parts = trimmed.split(separator).map((p) => p?.trim())
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

  translations: (val: string) => string
): string => {
  switch (fieldName) {
    case 'cardTitle':
      const titleError = !cardTitle || cardTitle?.trim().length === 0 ? translations('titleError') : ''
      return titleError

    case 'uploadedFiles':
      const totalImages = (uploadedFiles?.length || 0) + (remainingInitialImages?.length || 0)
      const filesError =
        totalImages < 1 ? translations('minimumImages') + `, ${translations('now')} ${totalImages}/1` : ''
      return filesError

    case 'pricesArray':
      const pricesError = !pricesArray || pricesArray.length === 0 ? translations('onePriceError') : ''
      return pricesError

    case 'description':
      const descError = !description || description?.trim().length === 0 ? translations('descriptionError') : ''
      return descError

    case 'descriptionMatrix':
      const filledRows = descriptionMatrix.filter((row) => row.some((cell) => cell?.trim()))
      const matrixError = filledRows.length === 0 ? translations('characteristicError') : ''
      return matrixError

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
            ? initialData?.mainDescription || ''
            : (initialData?.mainDescriptionTranslations && initialData.mainDescriptionTranslations[lang]) || '',
        furtherDescription:
          lang === currentLang
            ? initialData?.furtherDescription || ''
            : (initialData?.furtherDescriptionTranslations && initialData.furtherDescriptionTranslations[lang]) || '',
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

export const initializeFaqMatrixForOthers = (allLanguages: string[], currentLang: string, initialData: ICardFull) => {
  return allLanguages.reduce(
    (acc, lang) => ({
      ...acc,
      [lang]: initialData?.faq?.map((el) => [
        `${el.questionTranslations[lang as Language]}`,
        `${el.answerTranslations[lang as Language]} `
      ]) || [
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

export const initializeDescriptionMatrixForOthers = (
  allLanguages: string[],
  currentLang: string,
  initialData: ICardFull
) => {
  return allLanguages?.reduce(
    (acc, lang) => ({
      ...acc,
      [lang]:
        initialData?.characteristics.map((el) => [
          `${el.nameTranslations[lang as Language]}`,
          `${el.valueTranslations[lang as Language]}`
        ]) || []
    }),
    {}
  )
}

export const submitFormCardData = async ({
  cardObjectForOthers,
  faqMatrixForOthers,
  similarProducts,
  selectedCategory,
  langFromPathname,
  currentLangState,
  cardTitle,
  descriptions,
  multyLangObjectForPrices,
  uploadedFiles,
  remainingInitialImages,
  objectRemainingInitialImages,
  pricesArray,
  pathname,
  initialData
}: {
  cardObjectForOthers: Record<string, Partial<ICardFull>>
  faqMatrixForOthers: Record<string, string[][]>
  similarProducts: Set<Product>
  selectedCategory: ICategory | null
  langFromPathname: string
  currentLangState: string
  cardTitle: string
  descriptions: {
    ru: {description: string; additionalDescription: string | null; furtherDescription: string}
    en: {description: string; additionalDescription: string | null; furtherDescription: string}
    zh: {description: string; additionalDescription: string | null; furtherDescription: string}
    hi: {description: string; additionalDescription: string | null; furtherDescription: string}
  }
  multyLangObjectForPrices: Record<string, CardPriceElementsData>
  uploadedFiles: File[]
  remainingInitialImages: string[]
  objectRemainingInitialImages: {id: number; position: number}[]
  pricesArray: {
    currency: string
    priceWithDiscount: string
    priceWithoutDiscount: string
    quantity: string
    value: number
    unit: string
  }[]
  pathname: string
  initialData: ICardFull | undefined
}) => {
  console.log('--- submitFormCardData props ---')
  console.log('cardObjectForOthers:', cardObjectForOthers)
  console.log('faqMatrixForOthers:', faqMatrixForOthers)
  console.log('similarProducts:', similarProducts)
  console.log('selectedCategory:', selectedCategory)
  console.log('langFromPathname:', langFromPathname)
  console.log('currentLangState:', currentLangState)
  console.log('cardTitle:', cardTitle)
  console.log('descriptions:', descriptions)
  console.log('multyLangObjectForPrices:', multyLangObjectForPrices)
  console.log('uploadedFiles:', uploadedFiles)
  console.log('remainingInitialImages:', remainingInitialImages)
  console.log('objectRemainingInitialImages:', objectRemainingInitialImages)
  console.log('pricesArray:', pricesArray)

  const pricesArrayForSubmit = pricesArray.map((item) => ({
    ...item,
    quantity: parseQuantityRange(item.quantity)
  }))

  console.log('--- Processed data ---')
  console.log('pricesArrayForSubmit:', pricesArrayForSubmit)

  const isUpdate = pathname.match(/\d+$/) && (initialData?.id !== null || initialData?.id !== undefined)

  // Get access token
  const token = getAccessToken()

  // Prepare titles for all languages
  const allTitles = {
    ru: cardObjectForOthers.ru?.title || (langFromPathname === 'ru' ? cardTitle : ''),
    en: cardObjectForOthers.en?.title || (langFromPathname === 'en' ? cardTitle : ''),
    zh: cardObjectForOthers.zh?.title || (langFromPathname === 'zh' ? cardTitle : ''),
    hi: cardObjectForOthers.hi?.title || (langFromPathname === 'hi' ? cardTitle : '')
  }

  // Prepare main descriptions for all languages
  const mainDescriptionTranslations = {
    ru: descriptions.ru?.description || (langFromPathname === 'ru' ? descriptions.ru?.description : null),
    en: descriptions.en?.description || (langFromPathname === 'en' ? descriptions.en?.description : null),
    zh: descriptions.zh?.description || (langFromPathname === 'zh' ? descriptions.zh?.description : null),
    hi: descriptions.hi?.description || (langFromPathname === 'hi' ? descriptions.hi?.description : null)
  }

  // Prepare further descriptions for all languages
  const furtherDescriptionTranslations = {
    ru: descriptions.ru?.furtherDescription || descriptions.ru?.additionalDescription || null,
    en: descriptions.en?.furtherDescription || descriptions.en?.additionalDescription || null,
    zh: descriptions.zh?.furtherDescription || descriptions.zh?.additionalDescription || null,
    hi: descriptions.hi?.furtherDescription || descriptions.hi?.additionalDescription || null
  }

  // Prepare prices data
  const prices = pricesArrayForSubmit.map((price) => ({
    quantityFrom: typeof price.quantity === 'object' ? price.quantity.from.toString() : price.quantity,
    quantityTo: typeof price.quantity === 'object' ? price?.quantity?.to?.toString() : price.quantity,
    currency: price.currency,
    unit: price.unit,
    price: parseFloat(price.priceWithoutDiscount),
    discount:
      price.priceWithDiscount && price.priceWithoutDiscount
        ? Math.round(
            ((parseFloat(price.priceWithoutDiscount) - parseFloat(price.priceWithDiscount)) /
              parseFloat(price.priceWithoutDiscount)) *
              100 *
              100
          ) / 100
        : 0
  }))
  console.log('цена от и до:', prices)

  // Prepare similar products array
  const similarProductsArray = Array.from(similarProducts).map((product) => product.id)

  const characteristics =
    multyLangObjectForPrices[langFromPathname]?.characteristics?.map((char, i) => ({
      name: char?.title,
      nameTranslations: {
        ru: multyLangObjectForPrices?.ru?.characteristics?.[i]?.title,
        en: multyLangObjectForPrices?.en?.characteristics?.[i]?.title,
        zh: multyLangObjectForPrices?.zh?.characteristics?.[i]?.title,
        hi: multyLangObjectForPrices?.hi?.characteristics?.[i]?.title
      },
      value: char.characteristic,
      valueTranslations: {
        ru: multyLangObjectForPrices?.ru?.characteristics?.[i]?.characteristic,
        en: multyLangObjectForPrices?.en?.characteristics?.[i]?.characteristic,
        zh: multyLangObjectForPrices?.zh?.characteristics?.[i]?.characteristic,
        hi: multyLangObjectForPrices?.hi?.characteristics?.[i]?.characteristic
      }
    })) || []

  // Prepare FAQ data
  const faq = (
    faqMatrixForOthers[langFromPathname]?.map((faqItem, i) => ({
      question: faqItem?.[0] || '',
      questionTranslations: {
        ru: faqMatrixForOthers?.ru?.[i]?.[0] || '',
        en: faqMatrixForOthers?.en?.[i]?.[0] || '',
        zh: faqMatrixForOthers?.zh?.[i]?.[0] || '',
        hi: faqMatrixForOthers?.hi?.[i]?.[0] || ''
      },
      answer: faqItem?.[1] || '',
      answerTranslations: {
        ru: faqMatrixForOthers?.ru?.[i]?.[1] || '',
        en: faqMatrixForOthers?.en?.[i]?.[1] || '',
        zh: faqMatrixForOthers?.zh?.[i]?.[1] || '',
        hi: faqMatrixForOthers?.hi?.[i]?.[1] || ''
      }
    })) || []
  ).filter((item) => item.question && item.answer)

  const deliveryMethodDetails =
    multyLangObjectForPrices[langFromPathname]?.delivery
      ?.map((delivery, i) => ({
        name: delivery?.title,
        nameTranslations: {
          ru: multyLangObjectForPrices?.ru?.delivery?.[i]?.title || '',
          en: multyLangObjectForPrices?.en?.delivery?.[i]?.title || '',
          zh: multyLangObjectForPrices?.zh?.delivery?.[i]?.title || '',
          hi: multyLangObjectForPrices?.hi?.delivery?.[i]?.title || ''
        },
        value: delivery.daysDelivery,
        valueTranslations: {
          ru: multyLangObjectForPrices?.ru?.delivery?.[i]?.daysDelivery || '',
          en: multyLangObjectForPrices?.en?.delivery?.[i]?.daysDelivery || '',
          zh: multyLangObjectForPrices?.zh?.delivery?.[i]?.daysDelivery || '',
          hi: multyLangObjectForPrices?.hi?.delivery?.[i]?.daysDelivery || ''
        }
      }))
      .filter((item) => {
        const hasName = item.name && item.name?.trim() !== ''
        const hasAtLeastOneTranslation =
          (item.nameTranslations.ru && item.nameTranslations.ru?.trim() !== '') ||
          (item.nameTranslations.en && item.nameTranslations.en?.trim() !== '') ||
          (item.nameTranslations.zh && item.nameTranslations.zh?.trim() !== '') ||
          (item.nameTranslations.hi && item.nameTranslations.hi?.trim() !== '')
        return hasName && hasAtLeastOneTranslation
      }) || []

  // Prepare package options
  const packageOptions =
    multyLangObjectForPrices[langFromPathname]?.packaging
      ?.map((packaging, i) => ({
        name: packaging?.title || '',
        nameTranslations: {
          ru: multyLangObjectForPrices?.ru?.packaging?.[i]?.title || '',
          en: multyLangObjectForPrices?.en?.packaging?.[i]?.title || '',
          zh: multyLangObjectForPrices?.zh?.packaging?.[i]?.title || '',
          hi: multyLangObjectForPrices?.hi?.packaging?.[i]?.title || ''
        },
        price: parseFloat(packaging.price?.toString() || '0'),
        priceUnit: pricesArrayForSubmit[0].currency || 'RUB'
      }))
      .filter((item) => {
        const hasName = item.name && item.name?.trim() !== ''
        const hasAtLeastOneTranslation =
          (item.nameTranslations.ru && item.nameTranslations.ru?.trim() !== '') ||
          (item.nameTranslations.en && item.nameTranslations.en?.trim() !== '') ||
          (item.nameTranslations.zh && item.nameTranslations.zh?.trim() !== '') ||
          (item.nameTranslations.hi && item.nameTranslations.hi?.trim() !== '')
        return hasName && hasAtLeastOneTranslation
      }) || []

  // Process product media - separate old and new images
  const oldProductMedia: {id: number; position: number}[] = []

  // Handle remaining initial images (old images that are kept)
  remainingInitialImages.forEach((imageUrl, index) => {
    if (isUpdate) {
      const oldMedia = initialData?.media?.find((media) => media.url === imageUrl)
      if (oldMedia) {
        oldProductMedia.push({
          id: oldMedia?.id,
          position: index
        })
      }
    }
  })

  // Prepare the main data object
  const data = {
    title: allTitles[(langFromPathname || 'en') as keyof typeof allTitles] || cardTitle,
    titleTranslations: allTitles,
    mainDescription:
      mainDescriptionTranslations[(langFromPathname || 'en') as keyof typeof mainDescriptionTranslations],
    mainDescriptionTranslations,
    furtherDescription: (furtherDescriptionTranslations as any)?.[langFromPathname || 'en'] || '',
    furtherDescriptionTranslations,
    categoryId: selectedCategory?.id || 0,
    deliveryMethodIds: [1],
    prices,
    similarProducts: similarProductsArray,
    characteristics,
    faq,
    deliveryMethodDetails,
    packageOptions,
    minimumOrderQuantity: parseInt(multyLangObjectForPrices[langFromPathname || 'en']?.priceInfo?.minimalVolume || '1'),
    discountExpirationDate: parseInt(
      multyLangObjectForPrices[langFromPathname || 'en']?.priceInfo?.daysBeforeSale || '30'
    ),

    // Add old media fields only for updates
    ...(isUpdate && {
      oldProductMedia: oldProductMedia.length > 0 ? oldProductMedia : []
    })
  }

  // Prepare FormData
  const formData = new FormData()

  const jsonBlob = new Blob([JSON.stringify(data)], {type: 'application/json'})
  formData.append('data', jsonBlob)

  // Add product media files
  uploadedFiles.forEach((file) => {
    if (file instanceof File) {
      formData.append('productMedia', file)
    }
  })

  // Log final data object
  console.log('--- Final data object ---')
  console.log('Data to be sent:', JSON.stringify(data, null, 2))
  console.log('Product media files count:', uploadedFiles.length)
  console.log('Old product media:', oldProductMedia)

  // API call
  const method = isUpdate ? 'PUT' : 'POST'
  const url = isUpdate
    ? `${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/products/${initialData?.id}`
    : `${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/products`

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.log('full res', response, 'response.body', response.body)

      const errorMessage = errorData?.errors?.message || errorData?.message || `HTTP error! status: ${response.status}`

      toast.error(errorMessage)
      console.log('errorData in !response.ok', errorData, 'response', response)
      console.log('сообщение об ошибке', errorMessage)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`)
    }

    const result = await response.json()
    console.log('--- Submission successful ---')
    console.log('Result:', result)
    console.log('--- End of submitFormCardData logs ---')

    return result
  } catch (error) {
    console.error('--- Submission failed ---')
    console.error('Error:', error)
    console.log('--- End of submitFormCardData logs ---')
    throw error
  }
}
