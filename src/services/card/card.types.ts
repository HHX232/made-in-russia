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
  nameTranslations: {en: string; ru: string; zh: string}
  value: string
  valueTranslations: {en: string; ru: string; zh: string}
  creationDate: string
  lastModificationDate: string
}

interface Faq {
  id: number
  question: string
  questionTranslations: {en: string; ru: string; zh: string}
  answer: string
  answerTranslations: {en: string; ru: string; zh: string}
  creationDate: string
  lastModificationDate: string
}
interface DiscountPriceRange {
  creationDate: string // ISO-8601 дата и время
  currency: string // Валюта (в данном случае только RUB)
  discount: number // Размер скидки (в процентах или фиксированной сумме)
  discountedPrice: number // Цена со скидкой
  // expiryDate: string // ISO-8601 дата и время окончания действия
  from: number // Минимальное количество для применения скидки
  id: number // Уникальный идентификатор
  lastModificationDate: string // ISO-8601 дата и время последнего изменения
  // minimumOrderQuantity: number // Минимальный заказ
  originalPrice: number // Исходная цена
  to: number // Максимальное количество для применения скидки
  unit: string // Единица измерения (в данном случае кубометры)
}
interface ICardFull {
  packagingOptions?: {
    name: string
    price: number | string
    priceUnit: string
    nameTranslations: {en: string; ru: string; zh: string}
  }[]
  deliveryMethodsDetails?: {
    name: string
    value: string
    nameTranslations: {en: string; ru: string; zh: string}
    valueTranslations: {en: string; ru: string; zh: string}
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
    mainDescriptionTranslations: {en: string; ru: string; zh: string}
    furtherDescription: string
    furtherDescriptionTranslations: {en: string; ru: string; zh: string}
    media: {altText: string; url: string; id: number}[]
  }
  title: string
  titleTranslations: {en: string; ru: string; zh: string}
  mainDescription: string
  mainDescriptionTranslations: {en: string; ru: string; zh: string}
  furtherDescription: string
  furtherDescriptionTranslations: {en: string; ru: string; zh: string}
  // NOT FOUND =========
  summaryDescription: string // required, max 5000 characters
  primaryDescription: string // required, max 5000 characters
  originalPrice: number // required, decimal
  discount: number // required, range [0, 100], decimal
  discountedPrice: number // read-only, decimal
  priceUnit: string // required (например "USD / kg")
  // NOT FOUND =========
  previewImageUrl: string // required, URI
  creationDate: string // read-only, ISO date-time
  lastModificationDate: string // read-only, ISO date-time
  reviewsCount: number
}

interface Author {
  id: number
  avatar?: string
  role: string
  email: string
  login: string
  phoneNumber: string
  region: string
  registrationDate: string
  lastModificationDate: string
}

interface Review {
  id: number
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
  // totalElements: number
  // totalPages: number
  // size: number
  // number: number
  // sort: Sort
  // numberOfElements: number
  // first: boolean
  // empty: boolean
}
interface GetProductReviewsParams {
  /**
   * ID of the product to be retrieved
   * @example 20
   */
  productId: number // required (path parameter)

  /**
   * Zero-based page index (0..N)
   * @default 0
   */
  page?: number // optional (query parameter)

  /**
   * Number of product reviews per page
   * @default 10
   */
  size?: number // optional (query parameter)

  /**
   * Minimum product review rating filter (inclusive)
   * @minimum 1
   */
  minRating: number // required (query parameter)

  /**
   * Maximum product review rating filter (inclusive)
   * @maximum 10000
   */
  maxRating: number // required (query parameter)
}
// Правильный экспорт типов для isolatedModules
export type {Author, Review, Sort, Pageable, PaginatedResponse, GetProductReviewsParams}
export default ICardFull
