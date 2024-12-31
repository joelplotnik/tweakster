import { combineReducers, configureStore } from '@reduxjs/toolkit'

import challengePageSlice from './challengePage'
import notificationsSlice from './notifications'
import tokenSlice from './session'
import userSlice from './user'
import userPageSlice from './userPage'

const rootReducer = combineReducers({
  user: userSlice,
  token: tokenSlice,
  notifications: notificationsSlice,
  userPage: userPageSlice,
  challengePage: challengePageSlice,
})

const store = configureStore({
  reducer: rootReducer,
  devTools: false,
})

export default store
