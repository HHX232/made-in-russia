import ICardFull from '@/services/card/card.types'

export interface PriceData {
  quantityFrom: number
  quantityTo: number
  currency: string
  unit: string
  price: number
  discount: number
}

export type ICurrentLanguage = 'ru' | 'en' | 'zh'
export interface DeliveryMethodDetail {
  name: string
  value: string
}

export interface AboutVendorData {
  mainDescription: string
  furtherDescription: string
  mediaAltTexts: string[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface Characteristic {
  name: string
  value: string
}

export interface PackageOption {
  name: string
  price: number
  priceUnit: string
}

export interface CreateProductDto {
  mainDescription: string
  deliveryMethodIds: number[]
  prices: PriceData[]
  minimumOrderQuantity: string
  deliveryMethodDetails: DeliveryMethodDetail[]
  aboutVendor: AboutVendorData
  faq: FaqItem[]
  characteristics: Characteristic[]
  title: string
  titleTranslations: Record<string, string>
  mainDescriptionTranslations: Record<string, string>
  furtherDescription: string
  furtherDescriptionTranslations: Record<string, string>
  packageOptions: PackageOption[]
  categoryId: number
  discountExpirationDate: string | number
  similarProducts: number[]
  oldProductMedia?: {id: number; position: number}[]
  oldAboutVendorMedia?: {id: number; position: number}[]
}

// Типы для состояния компонентов
// Обновленный тип для поддержки File | string | null
export interface CompanyDescriptionData {
  topDescription: string
  images: Array<{
    image: File | string | null // Изменено: добавлена поддержка string
    description: string
  }>
  bottomDescription: string
}

// Интерфейс для ошибок валидации
export interface ValidationErrors {
  cardTitle: string
  uploadedFiles: string
  pricesArray: string
  description: string
  descriptionImages?: string
  descriptionMatrix: string
  companyData: string
  faqMatrix: string
}

export interface CreateCardProps {
  initialData?: ICardFull
}
