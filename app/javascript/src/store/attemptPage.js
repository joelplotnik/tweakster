import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  attempt: null,
}

const attemptPageSlice = createSlice({
  name: 'attemptPage',
  initialState,
  reducers: {
    setAttempt: (state, action) => {
      state.attempt = action.payload
    },
    incrementCommentsCount: (state, action) => {
      if (state.attempt) {
        state.attempt.comments_count += action.payload
      }
    },
    decrementCommentsCount: (state, action) => {
      if (state.attempt) {
        state.attempt.comments_count -= action.payload
      }
    },
  },
})

export const attemptPageActions = attemptPageSlice.actions
export default attemptPageSlice.reducer
