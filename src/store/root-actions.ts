import {basketSlice} from './Basket/Basket.slice'
import {favoritesSlice} from './Favorites/Favorites.types'
import {filtersSlice} from './Filters/filters.slice'
import {registrationSlice} from './registerUser/registerUser.slice'

export const rootActions = {
  ...filtersSlice.actions,
  ...basketSlice.actions,
  ...favoritesSlice.actions,
  ...registrationSlice.actions
}
