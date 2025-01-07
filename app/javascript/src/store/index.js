import { combineReducers, configureStore } from '@reduxjs/toolkit'

import attemptPageSlice from './attemptPage'
import challengePageSlice from './challengePage'
import gamePageSlice from './gamePage'
import notificationsSlice from './notifications'
import tokenSlice from './session'
import userSlice from './user'
import userPageSlice from './userPage'

const rootReducer = combineReducers({
  user: userSlice,
  token: tokenSlice,
  notifications: notificationsSlice,
  userPage: userPageSlice,
  gamePage: gamePageSlice,
  challengePage: challengePageSlice,
  attemptPage: attemptPageSlice,
})

const store = configureStore({
  reducer: rootReducer,
  devTools: false,
})

export default store
