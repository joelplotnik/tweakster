import { combineReducers, configureStore } from '@reduxjs/toolkit'

import notificationsSlice from './notifications'
import tokenSlice from './session'
import userSlice from './user'

const rootReducer = combineReducers({
  user: userSlice,
  token: tokenSlice,
  notifications: notificationsSlice,
})

const store = configureStore({
  reducer: rootReducer,
  devTools: false,
})

export default store
