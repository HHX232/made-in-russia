/* eslint-disable @typescript-eslint/no-explicit-any */
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {getAccessToken} from '@/services/auth/auth.helper'
import {toast} from 'sonner'
import {parseQuantityRange} from '../utils/createCardHelpers'
import {CreateProductDto} from '@/components/pages/CreateCard/CreateCard.types'

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
    },
    initialData?: any
  ) => {
    try {
      const currentMainDescription = formData.getCurrentMainDescription()
      const currentFurtherDescription = formData.getCurrentFurtherDescription()

      const data: CreateProductDto = {
        title: formData.cardTitle,
        mainDescription: currentMainDescription?.replace('## ' + t('alternativeMainDescr'), '').trim() || '',
        furtherDescription:
          currentFurtherDescription?.replace('## ' + t('alternativeAdditionalDescr'), '').trim() || '',
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
        deliveryMethodDetails: formData.descriptionMatrix
          .filter((row) => row[0] && row[1])
          .map((row) => ({name: row[0], value: row[1]})),
        aboutVendor: {
          mainDescription: formData.companyData.topDescription,
          furtherDescription: formData.companyData.bottomDescription,
          mediaAltTexts: formData.companyData.images
            .filter((img: any) => img.image !== null)
            .map((img: any) => img.description)
        },
        faq: formData.faqMatrix.filter((row) => row[0] && row[1]).map((row) => ({question: row[0], answer: row[1]})),
        characteristics: formData.descriptionMatrix
          .filter((row) => row[0] && row[1])
          .map((row) => ({name: row[0], value: row[1]})),
        packageOptions: formData.packageArray
          .filter((item) => item[0] && item[1])
          .map((item) => ({
            name: item[0],
            price: parseFloat(item[1]) || 0,
            priceUnit: formData.pricesArray[0]?.unit || 'RUB'
          })),
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
        ? `https://exporteru-prorumble.amvera.io/api/v1/products/${initialData.id}`
        : 'https://exporteru-prorumble.amvera.io/api/v1/products'

      const loadingToast = toast.loading(isUpdate ? t('updateCardProcess') : t('saveCardProcess'))

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
        <div style={{lineHeight: 1.5}}>
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
