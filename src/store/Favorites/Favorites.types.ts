import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {IFavoritesState} from './Favorites.slice'
import {Product} from '@/services/products/product.types'

const initialState: IFavoritesState = {
  favoritesIsEmpty: true,
  productInFavorites: []
}
export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleToFavorites: (state, action: PayloadAction<Product>) => {
      const existingProduct = state.productInFavorites.find((p) => p.id === action.payload.id)
      if (!existingProduct) {
        state.productInFavorites.push({
          ...action.payload
        })
      } else {
        state.productInFavorites = state.productInFavorites.filter((p) => {
          return p.id.toString() !== action.payload?.id.toString()
        })
        state.favoritesIsEmpty = state.productInFavorites.length === 0
      }
    }
  }
})
