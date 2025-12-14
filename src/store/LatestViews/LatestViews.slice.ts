import {Product} from '@/services/products/product.types'
import {createSlice, PayloadAction} from '@reduxjs/toolkit'

// Ключ для localStorage
const LATEST_VIEWS_IDS_KEY = 'latestViewsIds'

// Интерфейс состояния
interface LatestViewsState {
  latestViews: Product[]
  isEmpty: boolean
}

// Функция для загрузки ID из localStorage
export const loadIdsFromLocalStorage = (): number[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedData = localStorage.getItem(LATEST_VIEWS_IDS_KEY)
    if (storedData) {
      const parsed = JSON.parse(storedData)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (error) {
    console.error('Ошибка при загрузке ID из localStorage:', error)
  }

  return []
}

// Функция для сохранения ID в localStorage
export const saveIdsToLocalStorage = (ids: number[]): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(LATEST_VIEWS_IDS_KEY, JSON.stringify(ids))
  } catch (error) {
    console.error('Ошибка при сохранении ID в localStorage:', error)
  }
}

// Начальное состояние
const initialState: LatestViewsState = {
  latestViews: [],
  isEmpty: true
}

// Создание slice
const latestViewsSlice = createSlice({
  name: 'latestViews',
  initialState,
  reducers: {
    // Установка всего списка просмотренных товаров
    setLatestViews: (state, action: PayloadAction<Product[]>) => {
      state.latestViews = action.payload
      state.isEmpty = state.latestViews.length === 0
    },

    // Добавление товара в список последних просмотренных
    addToLatestViews: (state, action: PayloadAction<Product>) => {
      const product = action.payload

      // Проверяем, есть ли уже этот товар в списке
      const existingIndex = state.latestViews.findIndex((item) => item.id === product.id)

      // Если товар уже есть, удаляем его из текущей позиции
      if (existingIndex !== -1) {
        state.latestViews.splice(existingIndex, 1)
      }

      // Добавляем товар в НАЧАЛО массива (как самый новый)
      state.latestViews.unshift(product)

      // Обновляем флаг isEmpty
      state.isEmpty = state.latestViews.length === 0

      // Сохраняем только ID в localStorage
      const ids = state.latestViews.map((p) => p.id)
      saveIdsToLocalStorage(ids)
    },

    // Удаление конкретного товара из списка
    removeFromLatestViews: (state, action: PayloadAction<string | number>) => {
      const productId = action.payload
      state.latestViews = state.latestViews.filter((product) => product.id !== productId)
      state.isEmpty = state.latestViews.length === 0

      // Сохраняем обновленные ID в localStorage
      const ids = state.latestViews.map((p) => p.id)
      saveIdsToLocalStorage(ids)
    },

    // Очистка всего списка
    clearLatestViews: (state) => {
      state.latestViews = []
      state.isEmpty = true

      // Очищаем localStorage
      saveIdsToLocalStorage([])
    }
  }
})

// Экспорт actions
export const {setLatestViews, addToLatestViews, removeFromLatestViews, clearLatestViews} = latestViewsSlice.actions

// Селекторы
export const selectLatestViews = (state: {latestViews: LatestViewsState}) => state.latestViews.latestViews

export const selectIsLatestViewsEmpty = (state: {latestViews: LatestViewsState}) => state.latestViews.isEmpty

export const selectLatestViewsCount = (state: {latestViews: LatestViewsState}) => state.latestViews.latestViews.length

// Экспорт reducer
export default latestViewsSlice
