import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  game: null,
}

const gamePageSlice = createSlice({
  name: 'gamePage',
  initialState,
  reducers: {
    setGame: (state, action) => {
      state.game = action.payload
    },
  },
})

export const gamePageActions = gamePageSlice.actions
export default gamePageSlice.reducer
