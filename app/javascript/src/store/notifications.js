import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hasNewNotifications: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setHasNewNotifications: (state, action) => {
      state.hasNewNotifications = action.payload;
    },
    markNotificationsAsRead: (state) => {
      state.hasNewNotifications = false;
    },
  },
});

export const notificationsActions = notificationsSlice.actions;
export default notificationsSlice.reducer;
