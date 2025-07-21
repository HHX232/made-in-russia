/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useCreateCardForm.ts
import {useState} from 'react'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {Product} from '@/services/products/product.types'
import {ICurrentLanguage} from '@/components/pages/CreateCard/CreateCard.types'
import {
  initializeMultilingualData,
  initializeCompanyDataForOthers,
  initializeFaqMatrixForOthers,
  initializeDescriptionMatrixForOthers
} from '@/utils/createCardHelpers'
import {FormState} from '@/types/CreateCard.extended.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useCreateCardForm = (initialData?: any) => {
  const t = useTranslations('createCard')
  const currentLang = useCurrentLanguage()
  const allLanguages = ['ru', 'en', 'zh']

  const [formState, setFormState] = useState<FormState>(() => ({
    isValidForm: false,
    submitAttempted: false,
    similarProducts: new Set<Product>(),
    selectedCategory: initialData?.category || null,
    selectedDeliveryMethodIds: [1],
    saleDate: initialData?.daysBeforeDiscountExpires?.toString() || '',
    currentLangState: currentLang as ICurrentLanguage,
    cardTitle: initialData?.title || '',
    uploadedFiles: [],
    remainingInitialImages: initialData?.media.map((el: any) => el.url) || [],
    objectRemainingInitialImages:
      initialData?.media.map((el: any, i: number) => ({
        id: el.id,
        position: i
      })) || [],
    pricesArray:
      initialData?.prices.map((el: any) => ({
        currency: el.currency,
        priceWithDiscount: el.discountedPrice.toString(),
        priceWithoutDiscount: el.originalPrice.toString(),
        quantity: `${el.from}`,
        value: Math.min(el.discountedPrice, el.originalPrice),
        unit: el.unit
      })) || [],
    descriptionImages: [],
    descriptionMatrix: initialData?.characteristics.map((el: any) => [el.name, el.value]) || [],
    packageArray: [],
    companyData: {
      topDescription: initialData?.aboutVendor?.mainDescription || '',
      images:
        initialData?.aboutVendor?.media?.length > 0
          ? initialData.aboutVendor.media.map((el: any) => ({
              image: el.url as string,
              description: el.altText
            }))
          : [
              {image: null, description: ''},
              {image: null, description: ''},
              {image: null, description: ''},
              {image: null, description: ''}
            ],
      bottomDescription: initialData?.aboutVendor?.furtherDescription || ''
    },
    companyDataImages:
      initialData?.aboutVendor?.media.map((el: any, i: number) => ({
        id: el.id,
        position: i
      })) || [],
    faqMatrix: initialData?.faq.map((el: any) => [el.question, el.answer]) || [
      ['', ''],
      ['', ''],
      ['', ''],
      ['', ''],
      ['', '']
    ],
    errors: {
      cardTitle: '',
      uploadedFiles: '',
      pricesArray: '',
      description: '',
      descriptionImages: '',
      descriptionMatrix: '',
      companyData: '',
      faqMatrix: ''
    }
  }))

  // Многоязычные данные
  const [cardObjectForOthers, setCardObjectForOthers] = useState(() =>
    initializeMultilingualData(allLanguages, currentLang, initialData, t)
  )

  const [companyDataForOthers, setCompanyDataForOthers] = useState(() =>
    initializeCompanyDataForOthers(allLanguages, currentLang, initialData, formState.companyData)
  )

  const [faqMatrixForOthers, setFaqMatrixForOthers] = useState(() =>
    initializeFaqMatrixForOthers(allLanguages, currentLang, initialData)
  )

  const [descriptionMatrixForOthers, setDescriptionMatrixForOthers] = useState(() =>
    initializeDescriptionMatrixForOthers(allLanguages, currentLang, initialData)
  )

  return {
    formState,
    setFormState,
    cardObjectForOthers,
    setCardObjectForOthers,
    companyDataForOthers,
    setCompanyDataForOthers,
    faqMatrixForOthers,
    setFaqMatrixForOthers,
    descriptionMatrixForOthers,
    setDescriptionMatrixForOthers
  }
}
