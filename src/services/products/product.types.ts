import {User} from '../users.types'

/* eslint-disable @typescript-eslint/no-empty-object-type */
export const PRODUCTS = '/products-summary'

export interface Pageable {
  offset: number
  pageNumber: number
  pageSize: number
  paged: boolean
  unpaged: boolean
  sort: Sort
}

export interface Sort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface PageResponse<T> {
  content: T[]
  empty: boolean
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  pageable: Pageable
  size: number
  sort: Sort
  totalElements: number
  totalPages: number
}

// Специализированный интерфейс для ответа с продуктами
export interface ProductPageResponse extends PageResponse<Product> {
  // Можно добавить специфичные для продуктов поля, если нужно
}

// Старый интерфейс (остается без изменений)
export interface Product {
  user: User
  approveStatus?: 'APPROVED' | 'PENDING' | 'REJECTED'
  id: number
  deliveryMethod: DeliveryMethod
  deliveryMethods: DeliveryMethod[]
  title: string
  originalPrice: number
  discount: number
  previewImageUrl: string
  creationDate: Date | string
  lastModificationDate: Date | string
  discountedPrice: number
  priceCurrency: string
}

export interface DeliveryMethod {
  id: number
  name: string
  creationDate: Date | string
  lastModificationDate: Date | string
}
