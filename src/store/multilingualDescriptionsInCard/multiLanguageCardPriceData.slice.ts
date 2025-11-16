import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {
  CardPriceElementsState,
  Language,
  SetCharacteristicsPayload,
  SetDeliveryPayload,
  SetErrorPayload,
  SetPackagingPayload,
  UpdateCharacteristicPayload,
  UpdateDeliveryPayload,
  UpdatePackagingPayload,
  UpdatePriceInfoPayload
} from './multiLanguageCardPriceDataSlice.types'

// Начальное состояние
const initialState: CardPriceElementsState = {
  ru: {
    characteristics: [
      {title: '', characteristic: ''},
      {title: '', characteristic: ''},
      {title: '', characteristic: ''},
      {title: '', characteristic: ''},
      {title: '', characteristic: ''}
    ],
    delivery: [
      {title: '', daysDelivery: ''},
      {title: '', daysDelivery: ''}
    ],
    packaging: [
      {title: '', price: ''},
      {title: '', price: ''}
    ],
    priceInfo: {
      daysBeforeSale: '',
      minimalVolume: ''
    }
  },
  en: {
    characteristics: [
      {title: '', characteristic: ''},
      {title: '', characteristic: ''},
      {title: '', characteristic: ''},
      {title: '', characteristic: ''},
      {title: '', characteristic: ''}
    ],
    delivery: [
      {title: '', daysDelivery: ''},
      {title: '', daysDelivery: ''}
    ],
    packaging: [
      {title: '', price: ''},
      {title: '', price: ''}
    ],
    priceInfo: {
      daysBeforeSale: '',
      minimalVolume: ''
    }
  },
  zh: {
    characteristics: [
      {title: '', characteristic: ''},
      {title: '', characteristic: ''},
      {title: '', characteristic: ''},
      {title: '', characteristic: ''},
      {title: '', characteristic: ''}
    ],
    delivery: [
      {title: '', daysDelivery: ''},
      {title: '', daysDelivery: ''}
    ],
    packaging: [
      {title: '', price: ''},
      {title: '', price: ''}
    ],
    priceInfo: {
      daysBeforeSale: '',
      minimalVolume: ''
    }
  },
  hi: {
    characteristics: [
      {title: '', characteristic: ''},
      {title: '', characteristic: ''},
      {title: '', characteristic: ''},
      {title: '', characteristic: ''},
      {title: '', characteristic: ''}
    ],
    delivery: [
      {title: '', daysDelivery: ''},
      {title: '', daysDelivery: ''}
    ],
    packaging: [
      {title: '', price: ''},
      {title: '', price: ''}
    ],
    priceInfo: {
      daysBeforeSale: '',
      minimalVolume: ''
    }
  },
  currentLanguage: 'ru',
  errors: {
    ru: {
      characteristicsError: '',
      deliveryError: '',
      packagingError: '',
      saleDateError: '',
      minVolumeError: ''
    },
    en: {
      characteristicsError: '',
      deliveryError: '',
      packagingError: '',
      saleDateError: '',
      minVolumeError: ''
    },
    zh: {
      characteristicsError: '',
      deliveryError: '',
      packagingError: '',
      saleDateError: '',
      minVolumeError: ''
    },
    hi: {
      characteristicsError: '',
      deliveryError: '',
      packagingError: '',
      saleDateError: '',
      minVolumeError: ''
    }
  }
}

// Создание слайса
const multiLanguageCardPriceDataSlice = createSlice({
  name: 'multiLanguageCardPriceData',
  initialState,
  reducers: {
    // Установка текущего языка
    setCurrentLanguage: (state, action: PayloadAction<Language>) => {
      state.currentLanguage = action.payload
    },

    // Обновление характеристики
    updateCharacteristic: (state, action: PayloadAction<UpdateCharacteristicPayload>) => {
      const {language, index, field, value} = action.payload
      if (state[language].characteristics[index]) {
        state[language].characteristics[index][field] = value
      }
    },

    // Установка всех характеристик для языка
    setCharacteristics: (state, action: PayloadAction<SetCharacteristicsPayload>) => {
      const {language, characteristics} = action.payload
      state[language].characteristics = characteristics
    },

    // Добавление новой характеристики
    addCharacteristic: (state, action: PayloadAction<Language>) => {
      const language = action.payload
      if (state[language].characteristics.length < 20) {
        state[language].characteristics.push({title: '', characteristic: ''})
      }
    },

    // Удаление характеристики
    removeCharacteristic: (state, action: PayloadAction<{language: Language; index: number}>) => {
      const {language, index} = action.payload
      if (state[language].characteristics.length > 1) {
        state[language].characteristics.splice(index, 1)
      }
    },

    // Обновление доставки
    updateDelivery: (state, action: PayloadAction<UpdateDeliveryPayload>) => {
      const {language, index, field, value} = action.payload
      if (state[language].delivery[index]) {
        state[language].delivery[index][field] = value
      }
    },

    // Установка всей доставки для языка
    setDelivery: (state, action: PayloadAction<SetDeliveryPayload>) => {
      const {language, delivery} = action.payload
      state[language].delivery = delivery
    },

    // Добавление новой доставки
    addDelivery: (state, action: PayloadAction<Language>) => {
      const language = action.payload
      if (state[language].delivery.length < 5) {
        state[language].delivery.push({title: '', daysDelivery: ''})
      }
    },

    // Удаление доставки
    removeDelivery: (state, action: PayloadAction<{language: Language; index: number}>) => {
      const {language, index} = action.payload
      if (state[language].delivery.length > 1) {
        state[language].delivery.splice(index, 1)
      }
    },

    // Обновление упаковки
    updatePackaging: (state, action: PayloadAction<UpdatePackagingPayload>) => {
      const {language, index, field, value} = action.payload
      if (state[language].packaging[index]) {
        state[language].packaging[index][field] = value
      }
    },

    // Установка всей упаковки для языка
    setPackaging: (state, action: PayloadAction<SetPackagingPayload>) => {
      const {language, packaging} = action.payload
      state[language].packaging = packaging
    },

    // Добавление новой упаковки
    addPackaging: (state, action: PayloadAction<Language>) => {
      const language = action.payload
      if (state[language].packaging.length < 5) {
        state[language].packaging.push({title: '', price: ''})
      }
    },

    // Удаление упаковки
    removePackaging: (state, action: PayloadAction<{language: Language; index: number}>) => {
      const {language, index} = action.payload
      if (state[language].packaging.length > 1) {
        state[language].packaging.splice(index, 1)
      }
    },

    // Обновление информации о ценах
    updatePriceInfo: (state, action: PayloadAction<UpdatePriceInfoPayload>) => {
      const {language, field, value} = action.payload
      state[language].priceInfo[field] = value
    },

    // Установка ошибок
    setError: (state, action: PayloadAction<SetErrorPayload>) => {
      const {language, errorType, error} = action.payload
      state.errors[language][errorType] = error
    },

    // Очистка всех ошибок для языка
    clearErrors: (state, action: PayloadAction<Language>) => {
      const language = action.payload
      state.errors[language] = {
        characteristicsError: '',
        deliveryError: '',
        packagingError: '',
        saleDateError: '',
        minVolumeError: ''
      }
    },

    // Очистка всех данных для языка
    clearLanguageData: (state, action: PayloadAction<Language>) => {
      const language = action.payload
      state[language] = {
        characteristics: [
          {title: '', characteristic: ''},
          {title: '', characteristic: ''},
          {title: '', characteristic: ''},
          {title: '', characteristic: ''},
          {title: '', characteristic: ''}
        ],
        delivery: [
          {title: '', daysDelivery: ''},
          {title: '', daysDelivery: ''}
        ],
        packaging: [
          {title: '', price: ''},
          {title: '', price: ''}
        ],
        priceInfo: {
          daysBeforeSale: '',
          minimalVolume: ''
        }
      }
    },

    // Полная очистка всех данных
    resetState: () => initialState
  }
})

// Экспорт экшенов

// Экспорт редьюсера
export default multiLanguageCardPriceDataSlice
