/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useCreateCardForm.ts
import {useState} from 'react'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {Product} from '@/services/products/product.types'
import {CompanyDescriptionData, ICurrentLanguage} from '@/components/pages/CreateCard/CreateCard.types'
import {
  initializeMultilingualData,
  initializeCompanyDataForOthers,
  initializeFaqMatrixForOthers,
  initializeDescriptionMatrixForOthers
} from '@/utils/createCardHelpers'
import {FormState} from '@/types/CreateCard.extended.types'
import ICardFull from '@/services/card/card.types'
import {usePathname} from 'next/navigation'
import {Language} from '@/store/multilingualDescriptionsInCard/multiLanguageCardPriceDataSlice.types'

export const useCreateCardForm = (initialData?: ICardFull) => {
  const pathname = usePathname()
  const langFromPathname = pathname.split('/')[1]
  const currentLangFromHook = useCurrentLanguage()
  const currentLang = langFromPathname || currentLangFromHook
  const allLanguages = ['ru', 'en', 'zh']

  const [cardObjectForOthers, setCardObjectForOthers] = useState<Record<string, Partial<ICardFull>>>(() =>
    initializeMultilingualData(allLanguages as Language[], currentLang, initialData as ICardFull)
  )
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
        initialData && initialData?.aboutVendor && initialData?.aboutVendor?.media?.length > 0
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
    },
    cardObjectForOthers: cardObjectForOthers
  }))

  // Многоязычные данные

  const [companyDataForOthers, setCompanyDataForOthers] = useState<Record<string, CompanyDescriptionData>>(() =>
    initializeCompanyDataForOthers(allLanguages, currentLang, initialData, formState.companyData)
  )

  const [faqMatrixForOthers, setFaqMatrixForOthers] = useState<{[key: string]: string[][]}>(() =>
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
