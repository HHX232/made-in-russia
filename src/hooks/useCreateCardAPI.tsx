/* eslint-disable @typescript-eslint/no-explicit-any */
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
// import {getAccessToken} from '@/services/auth/auth.helper'
import {toast} from 'sonner'

import {CreateProductDto} from '@/components/pages/CreateCard/CreateCard.types'
import {getAccessToken} from '@/services/auth/auth.helper'
import {parseQuantityRange} from './createCardHelpers'

export const useCreateCardAPI = () => {
  const t = useTranslations('createCard')
  const currentLang = useCurrentLanguage()

  const submitForm = async (
    formData: {
      cardTitle: string
      getCurrentMainDescription: () => string | undefined
      getCurrentFurtherDescription: () => string | undefined
      selectedDeliveryMethodIds: number[]
      pricesArray: any[]
      descriptionMatrix: string[][]
      companyData: any
      faqMatrix: string[][]
      packageArray: string[][]
      selectedCategory: any
      saleDate: string
      similarProducts: Set<any>
      uploadedFiles: File[]
      objectRemainingInitialImages: any[]
      companyDataImages: any[]
      cardObjectForOthers: Record<string, any>
      companyDataForOthers: Record<string, any>
      faqMatrixForOthers: Record<string, string[][]>
      currentLangState: string
    },
    initialData?: any
  ) => {
    try {
      const currentMainDescription = formData.getCurrentMainDescription()
      const currentFurtherDescription = formData.getCurrentFurtherDescription()
      console.log('form data in start', formData)
      // Функция для создания объекта переводов
      const createTranslations = (
        currentValue: string,
        langKey: 'title' | 'mainDescription' | 'furtherDescription'
      ) => {
        const translations: Record<string, string> = {}

        // Проходим по всем языкам кроме текущего
        const languages = ['ru', 'en', 'zh']
        languages.forEach((lang) => {
          if (lang !== formData.currentLangState) {
            const value = formData.cardObjectForOthers[lang]?.[langKey]
            if (value && value.trim()) {
              translations[lang] = value
            }
          }
        })

        return Object.keys(translations).length > 0 ? translations : undefined
      }

      // Функция для создания переводов характеристик
      const createCharacteristicsWithTranslations = () => {
        return formData.descriptionMatrix
          .filter((row) => row[0] && row[1])
          .map((row) => {
            const characteristic: any = {
              name: row[0],
              value: row[1]
            }

            // Добавляем переводы если они есть
            const nameTranslations: Record<string, string> = {}
            const valueTranslations: Record<string, string> = {}

            const languages = ['ru', 'en', 'zh']
            languages.forEach((lang) => {
              if (lang !== formData.currentLangState) {
                const langData = formData.cardObjectForOthers[lang]
                if (langData?.characteristics) {
                  const matchingChar = langData.characteristics.find(
                    (char: any) => char.name === row[0] || char.nameTranslations?.[formData.currentLangState] === row[0]
                  )
                  if (matchingChar) {
                    if (matchingChar.name && matchingChar.name.trim()) {
                      nameTranslations[lang] = matchingChar.name
                    }
                    if (matchingChar.value && matchingChar.value.trim()) {
                      valueTranslations[lang] = matchingChar.value
                    }
                  }
                }
              }
            })

            if (Object.keys(nameTranslations).length > 0) {
              characteristic.nameTranslations = nameTranslations
            }
            if (Object.keys(valueTranslations).length > 0) {
              characteristic.valueTranslations = valueTranslations
            }

            return characteristic
          })
      }

      // Функция для создания FAQ с переводами
      const createFaqWithTranslations = () => {
        return formData.faqMatrix
          .filter((row) => row[0] && row[1])
          .map((row, index) => {
            const faqItem: any = {
              question: row[0],
              answer: row[1]
            }

            // Добавляем переводы
            const questionTranslations: Record<string, string> = {}
            const answerTranslations: Record<string, string> = {}

            const languages = ['ru', 'en', 'zh']
            languages.forEach((lang) => {
              if (lang !== formData.currentLangState && formData.faqMatrixForOthers[lang]) {
                const langFaq = formData.faqMatrixForOthers[lang][index]
                if (langFaq && langFaq[0] && langFaq[0].trim()) {
                  questionTranslations[lang] = langFaq[0]
                }
                if (langFaq && langFaq[1] && langFaq[1].trim()) {
                  answerTranslations[lang] = langFaq[1]
                }
              }
            })

            if (Object.keys(questionTranslations).length > 0) {
              faqItem.questionTranslations = questionTranslations
            }
            if (Object.keys(answerTranslations).length > 0) {
              faqItem.answerTranslations = answerTranslations
            }

            return faqItem
          })
      }

      // Функция для создания информации о компании с переводами
      const createAboutVendorWithTranslations = () => {
        const aboutVendor: any = {
          mainDescription: formData.companyData.topDescription,
          furtherDescription: formData.companyData.bottomDescription,
          mediaAltTexts: formData.companyData.images
            .filter((img: any) => img.image !== null)
            .map((img: any) => img.description)
        }

        // Добавляем переводы для описаний компании
        const mainDescTranslations: Record<string, string> = {}
        const furtherDescTranslations: Record<string, string> = {}

        const languages = ['ru', 'en', 'zh']
        languages.forEach((lang) => {
          if (lang !== formData.currentLangState && formData.companyDataForOthers[lang]) {
            const langCompanyData = formData.companyDataForOthers[lang]
            if (langCompanyData.topDescription && langCompanyData.topDescription.trim()) {
              mainDescTranslations[lang] = langCompanyData.topDescription
            }
            if (langCompanyData.bottomDescription && langCompanyData.bottomDescription.trim()) {
              furtherDescTranslations[lang] = langCompanyData.bottomDescription
            }
          }
        })

        if (Object.keys(mainDescTranslations).length > 0) {
          aboutVendor.mainDescriptionTranslations = mainDescTranslations
        }
        if (Object.keys(furtherDescTranslations).length > 0) {
          aboutVendor.furtherDescriptionTranslations = furtherDescTranslations
        }

        return aboutVendor
      }

      // Функция для создания опций упаковки с переводами
      const createPackageOptionsWithTranslations = () => {
        return formData.packageArray
          .filter((item) => item[0] && item[1])
          .map((item) => {
            const packageOption: any = {
              name: item[0],
              price: parseFloat(item[1]) || 0,
              priceUnit: formData.pricesArray[0]?.unit || 'RUB'
            }

            // Здесь можно добавить логику для переводов упаковки, если она есть
            // Пока оставляем базовую структуру

            return packageOption
          })
      }

      // Функция для создания деталей доставки с переводами
      const createDeliveryMethodDetailsWithTranslations = () => {
        return formData.descriptionMatrix
          .filter((row) => row[0] && row[1])
          .map((row) => {
            const detail: any = {
              name: row[0],
              value: row[1]
            }

            // Здесь можно добавить логику для переводов деталей доставки, если она есть
            // Пока оставляем базовую структуру

            return detail
          })
      }

      const data: CreateProductDto = {
        title: formData.cardTitle,
        titleTranslations: createTranslations(formData.cardTitle, 'title') || {},
        mainDescription: currentMainDescription?.replace('## ' + t('alternativeMainDescr'), '').trim() || '',
        mainDescriptionTranslations: createTranslations(currentMainDescription || '', 'mainDescription') || {},
        furtherDescription:
          currentFurtherDescription?.replace('## ' + t('alternativeAdditionalDescr'), '').trim() || '',
        furtherDescriptionTranslations: createTranslations(currentFurtherDescription || '', 'furtherDescription') || {},
        deliveryMethodIds: formData.selectedDeliveryMethodIds,
        prices: formData.pricesArray.map((price, index) => {
          const quantityRange = parseQuantityRange(price.quantity)

          let quantityTo: number
          if (quantityRange.to !== null) {
            quantityTo = quantityRange.to
          } else if (index < formData.pricesArray.length - 1) {
            const nextQuantityRange = parseQuantityRange(formData.pricesArray[index + 1].quantity)
            quantityTo = nextQuantityRange.from - 1
          } else {
            quantityTo = 999999
          }

          const originalPrice = parseFloat(price.priceWithoutDiscount) || 0
          const discountedPrice = parseFloat(price.priceWithDiscount) || 0
          const discountPercent =
            originalPrice > 0 ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0

          return {
            quantityFrom: quantityRange.from,
            quantityTo: quantityTo,
            currency: price.currency || 'RUB',
            unit: price.unit || t('elCount'),
            price: originalPrice,
            discount: discountPercent
          }
        }),
        minimumOrderQuantity:
          formData.pricesArray.length > 0 ? parseQuantityRange(formData.pricesArray[0].quantity).from.toString() : '1',
        deliveryMethodDetails: createDeliveryMethodDetailsWithTranslations(),
        aboutVendor: createAboutVendorWithTranslations(),
        faq: createFaqWithTranslations(),
        characteristics: createCharacteristicsWithTranslations(),
        packageOptions: createPackageOptionsWithTranslations(),
        categoryId: formData.selectedCategory.id,
        discountExpirationDate: formData.saleDate
          ? !isNaN(parseInt(formData.saleDate))
            ? parseInt(formData.saleDate)
            : 30
          : 0,
        similarProducts: Array.from(formData.similarProducts).map((product: any) => product.id)
      }

      const isUpdate = !!initialData?.id

      if (formData.objectRemainingInitialImages.length > 0 && isUpdate) {
        data.oldProductMedia = formData.objectRemainingInitialImages
      }
      if (formData.companyDataImages.length > 0 && isUpdate) {
        data.oldAboutVendorMedia = formData.companyDataImages
      }

      const formDataToSend = new FormData()
      const jsonBlob = new Blob([JSON.stringify(data)], {type: 'application/json'})
      formDataToSend.append('data', jsonBlob)

      formData.uploadedFiles.forEach((file) => {
        if (file instanceof File) {
          formDataToSend.append('productMedia', file)
        }
      })

      formData.companyData.images.forEach((item: any) => {
        if (item.image && item.image instanceof File) {
          formDataToSend.append('aboutVendorMedia', item.image)
        }
      })

      const token = await getAccessToken()
      const method = isUpdate ? 'PUT' : 'POST'
      const url = isUpdate
        ? `https://exporteru.com/api/v1/products/${initialData.id}`
        : 'https://exporteru.com/api/v1/products'

      const loadingToast = toast.loading(isUpdate ? t('updateCardProcess') : t('saveCardProcess'))
      console.log('formDataToSend', formDataToSend, Object.entries(formDataToSend))
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Accept-Language': currentLang
        },
        body: formDataToSend
      })

      const responseText = await response.text()
      toast.dismiss(loadingToast)

      if (!response.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = {message: responseText}
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('gratulation')}</strong>
          <span>
            {t('cardSuccess')} {t('successCreateCardEndText')}
          </span>
        </div>,
        {
          style: {background: '#2E7D32'},
          duration: 5000
        }
      )
    } catch (error: any) {
      console.error('Ошибка при сохранении:', error)
      toast.error(
        <div data-special-attr-for-error={true} style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('saveError')}</strong>
          <span>{error.message || t('saveErrorText')}</span>
        </div>,
        {
          style: {background: '#AC2525'},
          duration: 5000
        }
      )
    }
  }

  return {submitForm}
}
