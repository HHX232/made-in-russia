import {Product} from '@/services/products/product.types'
import {createSlice, PayloadAction} from '@reduxjs/toolkit'

// Ключ для localStorage
const LATEST_VIEWS_STORAGE_KEY = 'latestViews'

// Интерфейс состояния
interface LatestViewsState {
  latestViews: Product[]
  isEmpty: boolean
}

// Функция для загрузки данных из localStorage
const loadFromLocalStorage = (): Product[] => {
  // Проверка на клиентскую сторону (Next.js)
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedData = localStorage.getItem(LATEST_VIEWS_STORAGE_KEY)
    if (storedData) {
      const parsed = JSON.parse(storedData)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных из localStorage:', error)
  }

  return []
}

// Функция для сохранения данных в localStorage
const saveToLocalStorage = (products: Product[]): void => {
  // Проверка на клиентскую сторону (Next.js)
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(LATEST_VIEWS_STORAGE_KEY, JSON.stringify(products))
  } catch (error) {
    console.error('Ошибка при сохранении данных в localStorage:', error)
  }
}

// Начальное состояние с загрузкой из localStorage
const initialState: LatestViewsState = (() => {
  const loadedViews = loadFromLocalStorage()
  return {
    latestViews: loadedViews,
    isEmpty: loadedViews.length === 0
  }
})()

// Создание slice
const latestViewsSlice = createSlice({
  name: 'latestViews',
  initialState,
  reducers: {
    // Добавление товара в список последних просмотренных
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

      // Сохраняем в localStorage
      saveToLocalStorage(state.latestViews)
    },

    // Удаление конкретного товара из списка
    removeFromLatestViews: (state, action: PayloadAction<string | number>) => {
      const productId = action.payload
      state.latestViews = state.latestViews.filter((product) => product.id !== productId)
      state.isEmpty = state.latestViews.length === 0

      // Сохраняем в localStorage
      saveToLocalStorage(state.latestViews)
    },

    // Очистка всего списка
    clearLatestViews: (state) => {
      state.latestViews = []
      state.isEmpty = true

      // Очищаем localStorage
      saveToLocalStorage([])
    },

    setLatestViews: (state, action: PayloadAction<Product[]>) => {
      // Берем все переданные товары без ограничения по количеству
      state.latestViews = action.payload
      state.isEmpty = state.latestViews.length === 0

      // Сохраняем в localStorage
      saveToLocalStorage(state.latestViews)
    }
  }
})

// Экспорт actions
export const {addToLatestViews, removeFromLatestViews, clearLatestViews, setLatestViews} = latestViewsSlice.actions

// Селекторы
export const selectLatestViews = (state: {latestViews: LatestViewsState}) => state.latestViews.latestViews

export const selectIsLatestViewsEmpty = (state: {latestViews: LatestViewsState}) => state.latestViews.isEmpty

export const selectLatestViewsCount = (state: {latestViews: LatestViewsState}) => state.latestViews.latestViews.length

// Экспорт reducer
export default latestViewsSlice
