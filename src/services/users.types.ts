// Вспомогательные интерфейсы
export interface Country {
  id: number
  name: string
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
  avatar?: string // Сделал опциональным, так как в объекте не указан
  vendorDetails?: VendorDetails // Опциональное поле для пользователей с ролью Vendor
}
