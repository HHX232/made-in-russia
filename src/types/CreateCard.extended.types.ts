import {ICurrentLanguage, ValidationErrors} from '@/components/pages/CreateCard/CreateCard.types'
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
  minimalVolume?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cardObjectForOthers: any
  remainingInitialImages: string[]
  objectRemainingInitialImages: {id: number; position: number}[]
  pricesArray: PriceItem[]
  descriptionImages: ImageMapping[]
  descriptionMatrix: string[][]
  packageArray: string[][]
  selectedDeliveryIds: string[]
  // companyData: CompanyDescriptionData
  // companyDataImages: {id: number; position: number}[]
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
