// Типы для поддержки мультиязычности
export type Language = 'ru' | 'en' | 'zh' | 'hi'

// Интерфейс для описания и характеристик
export interface CharacteristicItem {
  title: string
  characteristic: string
}

// Интерфейс для доставки
export interface DeliveryItem {
  title: string
  daysDelivery: string
}

// Интерфейс для упаковки
export interface PackagingItem {
  title: string
  price: string
}

// Интерфейс для информации о ценах
export interface PriceInfo {
  daysBeforeSale: string
  minimalVolume: string
}

// Мультиязычный интерфейс для одного языка
export interface CardPriceElementsData {
  characteristics: CharacteristicItem[]
  delivery: DeliveryItem[]
  packaging: PackagingItem[]
  priceInfo: PriceInfo
}

// Основной интерфейс состояния
export interface CardPriceElementsState {
  ru: CardPriceElementsData
  en: CardPriceElementsData
  zh: CardPriceElementsData
  hi: CardPriceElementsData
  currentLanguage: Language
  errors: {
    ru: {
      characteristicsError: string
      deliveryError: string
      packagingError: string
      saleDateError: string
      minVolumeError: string
    }
    en: {
      characteristicsError: string
      deliveryError: string
      packagingError: string
      saleDateError: string
      minVolumeError: string
    }
    zh: {
      characteristicsError: string
      deliveryError: string
      packagingError: string
      saleDateError: string
      minVolumeError: string
    }
    hi: {
      characteristicsError: string
      deliveryError: string
      packagingError: string
      saleDateError: string
      minVolumeError: string
    }
  }
}

// Типы для экшенов
export interface UpdateCharacteristicPayload {
  language: Language
  index: number
  field: keyof CharacteristicItem
  value: string
}

export interface UpdateDeliveryPayload {
  language: Language
  index: number
  field: keyof DeliveryItem
  value: string
}

export interface UpdatePackagingPayload {
  language: Language
  index: number
  field: keyof PackagingItem
  value: string
}

export interface UpdatePriceInfoPayload {
  language: Language
  field: keyof PriceInfo
  value: string
}

export interface SetCharacteristicsPayload {
  language: Language
  characteristics: CharacteristicItem[]
}

export interface SetDeliveryPayload {
  language: Language
  delivery: DeliveryItem[]
}

export interface SetPackagingPayload {
  language: Language
  packaging: PackagingItem[]
}

export interface SetErrorPayload {
  language: Language
  errorType: 'characteristicsError' | 'deliveryError' | 'packagingError' | 'saleDateError' | 'minVolumeError'
  error: string
}
