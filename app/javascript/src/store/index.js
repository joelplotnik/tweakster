import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userSlice from './user';
import pieceSlice from './piece';
import pieceModalSlice from './piece-modal';
import channelPageSlice from './channel-page';
import userPageSlice from './user-page';

const rootReducer = combineReducers({
  user: userSlice,
  piece: pieceSlice,
  pieceModal: pieceModalSlice,
  channelPage: channelPageSlice,
  userPage: userPageSlice,
});

const store = configureStore({
  reducer: rootReducer,
  devTools: false,
});

export default store;
