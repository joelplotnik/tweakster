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
    updateFollowState: (state, action) => {
      const { isFollowing, followerCount } = action.payload
      state.user.is_following = isFollowing
      state.user.followers_count = followerCount
    },
  },
})

export const userPageActions = userPageSlice.actions
export default userPageSlice.reducer
