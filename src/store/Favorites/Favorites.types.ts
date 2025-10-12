import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Product} from '@/services/products/product.types'

export interface IFavoritesState {
  favoritesIsEmpty: boolean
  productInFavorites: Product[]
}

const FAVORITES_KEY = 'favorites'

// Загружаем состояние из localStorage
const loadFromLocalStorage = (): Product[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Сохраняем в localStorage
const saveToLocalStorage = (favorites: Product[]) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  } catch {
    // Игнорируем ошибки
  }
}

const initialState: IFavoritesState = {
  favoritesIsEmpty: false,
  productInFavorites: typeof window !== 'undefined' ? loadFromLocalStorage() : []
}

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleToFavorites: (state, action: PayloadAction<Product>) => {
      const exists = state.productInFavorites.find((p) => p.id === action.payload.id)

      if (!exists) {
        state.productInFavorites.push(action.payload)
      } else {
        state.productInFavorites = state.productInFavorites.filter((p) => p.id !== action.payload.id)
      }

      state.favoritesIsEmpty = state.productInFavorites.length === 0
      saveToLocalStorage(state.productInFavorites)
    },

    // опционально — очистка избранного
    clearFavorites: (state) => {
      state.productInFavorites = []
      state.favoritesIsEmpty = true
      saveToLocalStorage([])
    }
  }
})

export const {toggleToFavorites, clearFavorites} = favoritesSlice.actions
export default favoritesSlice.reducer
