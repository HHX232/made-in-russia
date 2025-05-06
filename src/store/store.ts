import {combineReducers, configureStore} from '@reduxjs/toolkit'
import {FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import {filtersSlice} from './Filters/filters.slice'
import {basketSlice} from './Basket/Basket.slice'
import {favoritesSlice} from './Favorites/Favorites.types'

const rootReducer = combineReducers({
  filters: filtersSlice.reducer,
  basket: basketSlice.reducer,
  favorites: favoritesSlice.reducer
})

const persistConfig = {
  key: 'persist store',
  storage,
  whitelist: ['filters', 'basket', 'favorites']
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
