import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Product} from '@/services/products/product.types'

export interface IFavoritesState {
  favoritesIsEmpty: boolean
  productInFavorites: Product[]
}

const initialState: IFavoritesState = {
  favoritesIsEmpty: true,
  productInFavorites: []
}

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites: (state, action: PayloadAction<Product[]>) => {
      state.productInFavorites = action.payload
      state.favoritesIsEmpty = action.payload.length === 0
    },

    toggleToFavorites: (state, action: PayloadAction<Product>) => {
      const exists = state.productInFavorites.find((p) => p.id === action.payload.id)

      if (!exists) {
        state.productInFavorites.push(action.payload)
      } else {
        state.productInFavorites = state.productInFavorites.filter((p) => p.id !== action.payload.id)
      }

      state.favoritesIsEmpty = state.productInFavorites.length === 0
    },

    clearFavorites: (state) => {
      state.productInFavorites = []
      state.favoritesIsEmpty = true
    }
  }
})

export const {setFavorites, toggleToFavorites, clearFavorites} = favoritesSlice.actions
export default favoritesSlice.reducer
