import {basketSlice} from './Basket/Basket.slice'
import {favoritesSlice} from './Favorites/Favorites.types'
import {filtersSlice} from './Filters/filters.slice'

export const rootActions = {
  ...filtersSlice.actions,
  ...basketSlice.actions,
  ...favoritesSlice.actions
  // ...userActions,
  // ...cartSlice.actions
}
