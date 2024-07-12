import { combineReducers, configureStore } from '@reduxjs/toolkit'

import channelPageSlice from './channel-page'
import notificationsSlice from './notifications'
import pieceSlice from './piece'
import pieceModalSlice from './piece-modal'
import userSlice from './user'
import userPageSlice from './user-page'

const rootReducer = combineReducers({
  user: userSlice,
  piece: pieceSlice,
  notifications: notificationsSlice,
  pieceModal: pieceModalSlice,
  channelPage: channelPageSlice,
  userPage: userPageSlice,
})

const store = configureStore({
  reducer: rootReducer,
  devTools: false,
})

export default store
