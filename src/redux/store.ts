import common from '@redux/slices/common'
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import rootReducer, { RootState } from './reducers'
import { pokemonApi } from './services/pokemon'

export const store = configureStore({
  reducer: {
    common,
    rootReducer,
    [pokemonApi.reducerPath]: pokemonApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(pokemonApi.middleware),
  devTools: process.env.NODE_ENV !== 'production'
})

setupListeners(store.dispatch)

export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
