import {combineReducers, configureStore} from '@reduxjs/toolkit'
import {FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE} from 'redux-persist'
import {filtersSlice} from './Filters/filters.slice'
import {basketSlice} from './Basket/Basket.slice'
import {favoritesSlice} from './Favorites/Favorites.types'
import {registrationSlice} from './registerUser/registerUser.slice'
import persistReducer from 'redux-persist/es/persistReducer'
import {persistStore} from 'redux-persist'
import {storage} from '@/utils/storage/storage'
import latestViewsSlice from './LatestViews/LatestViews.slice'

const filtersPersistConfig = {
  key: 'filters',
  storage: storage,
  blacklist: ['searchTitle', 'selectedFilters']
}

const rootReducer = combineReducers({
  filters: persistReducer(filtersPersistConfig, filtersSlice.reducer),
  basket: basketSlice.reducer,
  favorites: favoritesSlice.reducer,
  registration: registrationSlice.reducer,
  latestViews: latestViewsSlice.reducer
})

const persistConfig = {
  key: 'persist store',
  storage: storage,
  whitelist: ['basket', 'favorites', 'latestViews'] // убрали 'filters' отсюда
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

export const persistor = persistStore(store)

export type TypeRootState = ReturnType<typeof store.getState>
export type TypeAppDispatch = typeof store.dispatch
