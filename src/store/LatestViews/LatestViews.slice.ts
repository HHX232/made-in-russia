import {Product} from '@/services/products/product.types'
import {createSlice, PayloadAction} from '@reduxjs/toolkit'

// Интерфейс состояния
interface LatestViewsState {
  latestViews: Product[]
  isEmpty: boolean
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
    // Добавление товара в список последних просмотренных
    addToLatestViews: (state, action: PayloadAction<Product>) => {
      const product = action.payload

      // Проверяем, есть ли уже этот товар в списке
      const existingIndex = state.latestViews.findIndex((item) => item.id === product.id)

      // Если товар уже есть, удаляем его из текущей позиции
      if (existingIndex !== -1) {
        state.latestViews.splice(existingIndex, 1)
      }

      // Добавляем товар в конец массива (как самый новый)
      state.latestViews.push(product)

      // Если длина превышает 20, удаляем самый старый элемент (первый)
      if (state.latestViews.length > 20) {
        state.latestViews.shift()
      }

      // Обновляем флаг isEmpty
      state.isEmpty = state.latestViews.length === 0
    },

    // Удаление конкретного товара из списка
    removeFromLatestViews: (state, action: PayloadAction<string | number>) => {
      const productId = action.payload
      state.latestViews = state.latestViews.filter((product) => product.id !== productId)
      state.isEmpty = state.latestViews.length === 0
    },

    // Очистка всего списка
    clearLatestViews: (state) => {
      state.latestViews = []
      state.isEmpty = true
    },

    // Установка списка просмотренных товаров (например, при загрузке из localStorage)
    setLatestViews: (state, action: PayloadAction<Product[]>) => {
      // Ограничиваем массив 20 элементами, берем последние 20
      state.latestViews = action.payload.slice(-20)
      state.isEmpty = state.latestViews.length === 0
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
