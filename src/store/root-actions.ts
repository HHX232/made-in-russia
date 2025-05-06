import {basketSlice} from './Basket/Basket.slice'
import {filtersSlice} from './Filters/filters.slice'

export const rootActions = {
  ...filtersSlice.actions,
  ...basketSlice.actions
  // ...userActions,
  // ...cartSlice.actions
}
