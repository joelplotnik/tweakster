import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  piece: null,
}

const pieceSlice = createSlice({
  name: 'piece',
  initialState,
  reducers: {
    setPiece: (state, action) => {
      state.piece = action.payload
    },
    clearPiece: state => {
      state.piece = null
    },
    updateVote: (state, action) => {
      const piece = state.piece
      if (piece) {
        const userId = action.payload.userId
        const voteType = action.payload.voteType
        // Find the vote associated with the user in the piece's votes array
        const userVoteIndex = piece.votes.findIndex(
          vote => vote.user_id === userId
        )

        if (userVoteIndex !== -1) {
          if (piece.votes[userVoteIndex].vote_type === 1 && voteType === -1) {
            // User's previous vote was a like, and the incoming vote is a dislike
            piece.likes -= 1
            piece.dislikes += 1
            piece.votes[userVoteIndex].vote_type = -1 // Update the vote_type
          } else if (
            piece.votes[userVoteIndex].vote_type === -1 &&
            voteType === 1
          ) {
            // User's previous vote was a dislike, and the incoming vote is a like
            piece.likes += 1
            piece.dislikes -= 1
            piece.votes[userVoteIndex].vote_type = 1 // Update the vote_type
          } else if (
            piece.votes[userVoteIndex].vote_type === 1 &&
            voteType === 1
          ) {
            // User's previous vote was a like, and the incoming vote is also a like
            piece.likes -= 1
            piece.votes.splice(userVoteIndex, 1) // Remove the user's vote
          } else if (
            piece.votes[userVoteIndex].vote_type === -1 &&
            voteType === -1
          ) {
            // User's previous vote was a dislike, and the incoming vote is also a dislike
            piece.dislikes -= 1
            piece.votes.splice(userVoteIndex, 1) // Remove the user's vote
          }
        } else {
          piece.votes.push({ user_id: userId, vote_type: voteType })
          if (voteType === 1) {
            piece.likes += 1
          } else if (voteType === -1) {
            piece.dislikes += 1
          }
        }
      }
    },
    increaseCommentCount: state => {
      const piece = state.piece
      if (piece) {
        piece.comments_count += 1
      }
    },
    decreaseCommentCount: (state, action) => {
      const piece = state.piece
      if (piece) {
        const decreaseCommentCountBy = action.payload.decreaseCommentCountBy
        piece.comments_count -= decreaseCommentCountBy
      }
    },
  },
})

export const pieceActions = pieceSlice.actions

export default pieceSlice.reducer
