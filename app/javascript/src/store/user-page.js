import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
}

const userPageSlice = createSlice({
  name: 'userPage',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
    },
    updateFollowerState: (state, action) => {
      state.user.following = action.payload
    },
    updateFollowerCount: (state, action) => {
      state.user.follower_count = action.payload
    },
    updateFaveChannels: (state, action) => {
      state.user.favorite_channels = action.payload
    },
    updateFaveUsers: (state, action) => {
      state.user.favorite_users = action.payload
    },
  },
})

export const userPageActions = userPageSlice.actions
export default userPageSlice.reducer
