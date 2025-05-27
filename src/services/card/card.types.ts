interface Category {
  id: number
  name: string
  creationDate: string // ISO date-time string
  lastModificationDate: string // ISO date-time string
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
  value: string
  creationDate: string
  lastModificationDate: string
}

interface ICardFull {
  id: number // read-only
  category: Category
  deliveryMethod: DeliveryMethod
  deliveryMethods: DeliveryMethod[]
  media: Media[]
  characteristics: Characteristic[]
  article: string // read-only, 9 characters
  title: string // required, max 255 characters
  mainDescription: string // required, max 20000 characters (может содержать HTML)
  furtherDescription: string // required, max 5000 characters
  summaryDescription: string // required, max 5000 characters
  primaryDescription: string // required, max 5000 characters
  originalPrice: number // required, decimal
  discount: number // required, range [0, 100], decimal
  discountedPrice: number // read-only, decimal
  priceUnit: string // required (например "USD / kg")
  previewImageUrl: string // required, URI
  creationDate: string // read-only, ISO date-time
  lastModificationDate: string // read-only, ISO date-time
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
  images?: string[]
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
  offset: number
  sort: Sort
  paged: boolean
  pageNumber: number
  pageSize: number
  unpaged: boolean
}

interface PaginatedResponse<T> {
  content: T[]
  pageable: Pageable
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: Sort
  numberOfElements: number
  first: boolean
  empty: boolean
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
