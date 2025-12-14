// Вспомогательные интерфейсы
export interface Country {
  id: number
  name: string
  value: string
  creationDate: string
  lastModificationDate: string
}

export interface ProductCategory {
  id: number
  name: string
  creationDate: string
  lastModificationDate: string
}

export interface VendorDetails {
  id: number
  inn: string
  creationDate: string
  lastModificationDate: string
  countries: Country[]
  productCategories: ProductCategory[]
  viewsCount?: number | string
  faq?: {question: string; answer: string}[]
  address?: string
}

// Основной интерфейс User
export interface User {
  id: number
  role: string
  email: string
  login: string
  phoneNumber: string
  region?: string // Сделал опциональным, так как в объекте не указан
  registrationDate: string
  lastModificationDate: string
  isEnabled?: boolean
  avatarUrl?: string // Сделал опциональным, так как в объекте не указан
  vendorDetails?: VendorDetails // Опциональное поле для пользователей с ролью Vendor
}
