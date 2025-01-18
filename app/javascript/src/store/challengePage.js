import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  challenge: null,
}

const challengePageSlice = createSlice({
  name: 'challengePage',
  initialState,
  reducers: {
    setChallenge: (state, action) => {
      state.challenge = action.payload
    },
    incrementCommentsCount: (state, action) => {
      if (state.challenge) {
        state.challenge.comments_count += action.payload
      }
    },
    decrementCommentsCount: (state, action) => {
      if (state.challenge) {
        state.challenge.comments_count -= action.payload
      }
    },
  },
})

export const challengePageActions = challengePageSlice.actions
export default challengePageSlice.reducer
