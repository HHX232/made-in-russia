import {basketSlice} from './Basket/Basket.slice'
import {favoritesSlice} from './Favorites/Favorites.types'
import {filtersSlice} from './Filters/filters.slice'
import latestViewsSlice from './LatestViews/LatestViews.slice'
import multiLanguageCardPriceDataSlice from './multilingualDescriptionsInCard/multiLanguageCardPriceData.slice'
import multilingualDescriptionsSlice from './multilingualDescriptionsInCard/multilingualDescriptions.slice'
import {registrationSlice} from './registerUser/registerUser.slice'
import sliderHomeSlice from './sliderHomeSlice/sliderHomeSlice'
import userSlice from './User/user.slice'
import currentLangSlice from './сurrentLangStore/сurrentLangStore.slice'
import * as chatActions from './slices/chatSlice'

export const rootActions = {
  ...filtersSlice.actions,
  ...basketSlice.actions,
  ...favoritesSlice.actions,
  ...registrationSlice.actions,
  ...latestViewsSlice.actions,
  ...multilingualDescriptionsSlice.actions,
  ...multiLanguageCardPriceDataSlice.actions,
  ...userSlice.actions,
  ...currentLangSlice.actions,
  ...sliderHomeSlice.actions,
  setUnreadTotal: chatActions.setUnreadTotal
}
