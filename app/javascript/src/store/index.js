import { combineReducers, configureStore } from '@reduxjs/toolkit'

import notificationsSlice from './notifications'
import userSlice from './user'
import userPageSlice from './userPage'

const rootReducer = combineReducers({
  user: userSlice,
  notifications: notificationsSlice,
  userPage: userPageSlice,
})

const store = configureStore({
  reducer: rootReducer,
  devTools: false,
})

export default store
