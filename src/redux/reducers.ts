import counter from '@redux/slices/counter'
import { combineReducers } from 'redux'

import { store } from './store'

const rootReducer = combineReducers({ counter })

export type RootState = ReturnType<typeof store.getState>

export default rootReducer
