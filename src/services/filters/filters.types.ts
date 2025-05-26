export const FILTERS = 'categories'
export const DELIVERY = '/delivery-methods'
export interface Filter {
  id: number
  name: string
  creationDate: string | Date
  lastModificationDate: string // аналогично
}

// Для массива категорий:
export type FiltersResponse = Filter[]
export interface DeliveryMethod {
  id: number
  name: string
  creationDate: string
  lastModificationDate: string
}
