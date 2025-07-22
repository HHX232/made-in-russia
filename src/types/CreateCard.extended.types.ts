import {
  ICurrentLanguage,
  CompanyDescriptionData,
  ValidationErrors
} from '@/components/pages/CreateCard/CreateCard.types'
import {ImageMapping} from '@/components/pages/CreateCard/CreateDescriptionsElements/CreateDescriptionsElements'
import {ICategory} from '@/services/card/card.types'
import {Product} from '@/services/products/product.types'

export interface FormState {
  isValidForm: boolean
  submitAttempted: boolean
  similarProducts: Set<Product>
  selectedCategory: ICategory | null
  selectedDeliveryMethodIds: number[]
  saleDate: string
  currentLangState: ICurrentLanguage
  cardTitle: string
  uploadedFiles: File[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cardObjectForOthers: any // Добавляем это поле
  remainingInitialImages: string[]
  objectRemainingInitialImages: {id: number; position: number}[]
  pricesArray: PriceItem[]
  descriptionImages: ImageMapping[]
  descriptionMatrix: string[][]
  packageArray: string[][]
  companyData: CompanyDescriptionData
  companyDataImages: {id: number; position: number}[]
  faqMatrix: string[][]
  errors: ValidationErrors
}

export interface PriceItem {
  currency: string
  priceWithDiscount: string
  priceWithoutDiscount: string
  quantity: string
  value: number
  unit: string
}
