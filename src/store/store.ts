import {combineReducers, configureStore} from '@reduxjs/toolkit'
import {filtersSlice} from './Filters/filters.slice'
import {basketSlice} from './Basket/Basket.slice'
import {favoritesSlice} from './Favorites/Favorites.types'
import {registrationSlice} from './registerUser/registerUser.slice'
// import {storage} from '@/utils/storage/storage'
import latestViewsSlice from './LatestViews/LatestViews.slice'
import multilingualDescriptionsSlice from './multilingualDescriptionsInCard/multilingualDescriptions.slice'
import multiLanguageCardPriceDataSlice from './multilingualDescriptionsInCard/multiLanguageCardPriceData.slice'

const rootReducer = combineReducers({
  filters: filtersSlice.reducer,
  basket: basketSlice.reducer,
  favorites: favoritesSlice.reducer,
  registration: registrationSlice.reducer,
  latestViews: latestViewsSlice.reducer,
  multilingualDescriptions: multilingualDescriptionsSlice.reducer,
  multiLanguageCardPriceData: multiLanguageCardPriceDataSlice.reducer
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
})

export type TypeRootState = ReturnType<typeof store.getState>
export type TypeAppDispatch = typeof store.dispatch
