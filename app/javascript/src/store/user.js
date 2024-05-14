import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      localStorage.setItem('user', JSON.stringify(action.payload));
      state.user = action.payload;
    },
    clearUser(state) {
      localStorage.removeItem('user');
      state.user = null;
    },
  },
});

export const userActions = userSlice.actions;
export default userSlice.reducer;
