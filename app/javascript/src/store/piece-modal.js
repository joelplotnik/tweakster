import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pieceModalActive: null,
};

const pieceModalSlice = createSlice({
  name: 'pieceModal',
  initialState,
  reducers: {
    setPieceModalActive(state, action) {
      state.pieceModalActive = action.payload;
    },
    resetPieceModalState(state) {
      state.pieceModalActive = null;
    },
  },
});

export const pieceModalActions = pieceModalSlice.actions;
export default pieceModalSlice.reducer;
