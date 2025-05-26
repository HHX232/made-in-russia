import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {TypeRootState} from '../store'

// Определяем типы значений фильтров
type FilterValue = boolean | {min: number; max: number}

// Определяем тип состояния для фильтров
interface FiltersState {
  selectedFilters: Record<string, FilterValue> // Хранит состояние фильтров: { [filterName]: boolean | { min, max } }
  delivery: string[]
}

// Начальное состояние
const initialState: FiltersState = {
  selectedFilters: {},
  delivery: []
}

// Создаем slice
export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Установка фильтра в определенное состояние (для чекбоксов)
    setFilter: (state, action: PayloadAction<{filterName: string; checked: boolean}>) => {
      const {filterName, checked} = action.payload
      // Если unchecked, можно удалить фильтр из состояния
      if (!checked) {
        delete state.selectedFilters[filterName]
      } else {
        state.selectedFilters[filterName] = checked
      }
    },

    // Установка диапазонного фильтра (для RangeInput)
    setRangeFilter: (state, action: PayloadAction<{filterName: string; min: number; max: number}>) => {
      const {filterName, min, max} = action.payload
      state.selectedFilters[filterName] = {min, max}
    },

    // Переключение состояния фильтра
    toggleFilter: (state, action: PayloadAction<string>) => {
      const filterName = action.payload
      const currentValue = state.selectedFilters[filterName]

      if (currentValue) {
        delete state.selectedFilters[filterName]
      } else {
        state.selectedFilters[filterName] = true
      }
    },

    // Сброс всех фильтров
    clearFilters: (state) => {
      state.selectedFilters = {}
    },

    setMultipleFilters: (state, action: PayloadAction<Record<string, FilterValue>>) => {
      state.selectedFilters = {
        ...state.selectedFilters,
        ...action.payload
      }
    },
    addToDelivery: (state, action: PayloadAction<string>) => {
      if (!state.delivery.includes(action.payload)) {
        state.delivery.push(action.payload)
      }
    },

    removeFromDelivery: (state, action: PayloadAction<string>) => {
      state.delivery = state.delivery.filter((item) => item !== action.payload)
    },

    toggleDelivery: (state, action: PayloadAction<string>) => {
      const exists = state.delivery.includes(action.payload)
      if (exists) {
        state.delivery = state.delivery.filter((item) => item !== action.payload)
      } else {
        state.delivery.push(action.payload)
      }
    },

    clearDelivery: (state) => {
      state.delivery = []
    },

    setDelivery: (state, action: PayloadAction<string[]>) => {
      state.delivery = action.payload
    }
  }
})

// Экспортируем action creators
export const {setFilter, setRangeFilter, toggleFilter, clearFilters, setMultipleFilters} = filtersSlice.actions

// Селектор для получения булевого фильтра
export const selectFilter = (state: TypeRootState, filterName: string): boolean => {
  const filter = state.filters.selectedFilters[filterName]
  return typeof filter === 'boolean' ? filter : false
}

// Селектор для получения диапазонного фильтра
export const selectRangeFilter = (state: TypeRootState, filterName: string): {min: number; max: number} | undefined => {
  const filter = state.filters.selectedFilters[filterName]
  if (filter && typeof filter === 'object' && 'min' in filter && 'max' in filter) {
    return filter as {min: number; max: number}
  }
  return undefined
}

// Селектор для получения всех фильтров
export const selectAllFilters = (state: TypeRootState) => state.filters.selectedFilters

// Селектор для получения активных булевых фильтров
export const selectActiveFilters = (state: TypeRootState) =>
  Object.keys(state.filters.selectedFilters).filter(
    (key) => typeof state.filters.selectedFilters[key] === 'boolean' && state.filters.selectedFilters[key]
  )

export default filtersSlice.reducer

export const selectDelivery = (state: TypeRootState) => state.filters.delivery
