import {basketSlice} from './Basket/Basket.slice'
import {favoritesSlice} from './Favorites/Favorites.types'
import {filtersSlice} from './Filters/filters.slice'
import latestViewsSlice from './LatestViews/LatestViews.slice'
import multilingualDescriptionsSlice from './multilingualDescriptionsInCard/multilingualDescriptions.slice'
import {registrationSlice} from './registerUser/registerUser.slice'

export const rootActions = {
  ...filtersSlice.actions,
  ...basketSlice.actions,
  ...favoritesSlice.actions,
  ...registrationSlice.actions,
  ...latestViewsSlice.actions,
  ...multilingualDescriptionsSlice.actions
}
