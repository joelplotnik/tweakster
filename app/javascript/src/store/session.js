import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  token: localStorage.getItem('token') || null,
}

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload
    },
    clearToken(state) {
      state.token = null
    },
  },
})

export const tokenActions = tokenSlice.actions
export default tokenSlice.reducer
