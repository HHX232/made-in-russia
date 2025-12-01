import {DeliveryTerm} from '@/components/UI-kit/DeliveryTermsSelector/DeliveryTermsSelector'

export interface ICategory {
  id: number
  name: string
  slug: string
  imageUrl: string
  children: ICategory[]
  creationDate: string
  lastModificationDate: string
}

interface DeliveryMethod {
  id: number
  name: string
  creationDate: string
  lastModificationDate: string
}

interface Media {
  id: number
  mediaType: 'image' | 'video' | string
  mimeType: string
  url: string
  altText: string
  creationDate: string
  lastModificationDate: string
}

interface Characteristic {
  id: number
  name: string
  nameTranslations: {en: string; ru: string; zh: string; hi: string}
  value: string
  valueTranslations: {en: string; ru: string; zh: string; hi: string}
  creationDate: string
  lastModificationDate: string
}

interface Faq {
  id: number
  question: string
  questionTranslations: {en: string; ru: string; zh: string; hi: string}
  answer: string
  answerTranslations: {en: string; ru: string; zh: string; hi: string}
  creationDate: string
  lastModificationDate: string
}

interface DiscountPriceRange {
  creationDate: string
  currency: string
  discount: number
  discountedPrice: number
  from: number
  id: number
  lastModificationDate: string
  originalPrice: number
  to: number
  unit: string
}

interface ICardFull {
  approveStatus?: 'APPROVED' | 'PENDING' | 'REJECTED'
  deliveryTerms: DeliveryTerm[]
  packagingOptions?: {
    name: string
    price: number | string
    priceUnit: string
    nameTranslations: {en: string; ru: string; zh: string; hi: string}
  }[]
  deliveryMethodsDetails?: {
    name: string
    value: string
    nameTranslations: {en: string; ru: string; zh: string; hi: string}
    valueTranslations: {en: string; ru: string; zh: string; hi: string}
  }[]
  minimumOrderQuantity?: number
  user: Author
  daysBeforeDiscountExpires: number | string
  prices: DiscountPriceRange[]
  id: number
  similarProducts: {
    id: number
    imageUrl: string
    title: string
  }[]
  reviewsMedia: Media[]
  category: ICategory
  deliveryMethod: DeliveryMethod
  deliveryMethods: DeliveryMethod[]
  media: Media[]
  rating: number
  characteristics: Characteristic[]
  article: string
  faq: Faq[]
  ordersCount: number
  aboutVendor?: {
    mainDescription: string
    mainDescriptionTranslations: {en: string; ru: string; zh: string; hi: string}
    furtherDescription: string
    furtherDescriptionTranslations: {en: string; ru: string; zh: string; hi: string}
    media: {altText: string; url: string; id: number}[]
  }
  title: string
  titleTranslations: {en: string; ru: string; zh: string; hi: string}
  mainDescription: string
  mainDescriptionTranslations: {en: string; ru: string; zh: string; hi: string}
  furtherDescription: string
  furtherDescriptionTranslations: {en: string; ru: string; zh: string; hi: string}
  summaryDescription: string
  primaryDescription: string
  originalPrice: number
  discount: number
  discountedPrice: number
  priceUnit: string
  previewImageUrl: string
  creationDate: string
  lastModificationDate: string
  reviewsCount: number
}

interface Author {
  id: number
  avatarUrl?: string
  role: string
  email: string
  login: string
  phoneNumber: string
  region: string
  registrationDate: string
  lastModificationDate: string
  vendorDetails?: {
    address?: string
    countries?: {id: string; name: string}[]
    creationDate?: string
    description?: string
    emails?: string[]
    id?: number
    inn?: string
    lastModificationDate?: string
    phoneNumbers?: string[]
    productCategories?: {id: string; name: string}[]
    sites?: string[]
    viewsCount?: number
  }
}

interface Review {
  id: number
  product: {title: string; previewImageUrl: string}
  approveStatus?: 'APPROVED' | 'PENDING' | 'REJECTED'
  media?: {
    id: number
    url: string
    mediaType: string
    mimeType: string
    altText: string
    creationDate: string
    lastModificationDate: string
  }[]
  author: Author
  text: string
  rating: number
  creationDate: string
  lastModificationDate: string
}

interface Sort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

interface Pageable {
  number: number
  size: number
  totalElements: number
  totalPages: number
}

interface PaginatedResponse<T> {
  content: T[]
  page: Pageable
  last: boolean
}

interface GetProductReviewsParams {
  productId: number
  page?: number
  size?: number
  minRating: number
  maxRating: number
}

export type {Author, Review, Sort, Pageable, PaginatedResponse, GetProductReviewsParams}
export default ICardFull
