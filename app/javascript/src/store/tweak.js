import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

const tweakAdapater = createEntityAdapter({
  selectId: (tweak) => tweak.id,
});

const initialState = tweakAdapater.getInitialState({
  selectedTweak: null,
});

const tweakSlice = createSlice({
  name: 'tweak',
  initialState,
  reducers: {
    setTweaks: tweakAdapater.addMany,
    resetTweaks: () => initialState,
    selectTweak: (state, action) => {
      state.selectedTweak = action.payload;
    },
    setTweak: (state, action) => {
      tweakAdapater.upsertOne(state, action.payload);
    },
    removeTweak: tweakAdapater.removeOne, // Use the adapter's removeOne function to remove a tweak
    updateVote: (state, action) => {
      const tweak = state.entities[action.payload.id];
      if (tweak) {
        const userId = action.payload.userId;
        const voteType = action.payload.voteType;

        // Find the vote associated with the user in the tweak's votes array
        const userVoteIndex = tweak.votes.findIndex(
          (vote) => vote.user_id === userId
        );

        if (userVoteIndex !== -1) {
          if (tweak.votes[userVoteIndex].vote_type === 1 && voteType === -1) {
            // User's previous vote was a like, and the incoming vote is a dislike
            tweak.likes -= 1;
            tweak.dislikes += 1;
            tweak.votes[userVoteIndex].vote_type = -1; // Update the vote_type
          } else if (
            tweak.votes[userVoteIndex].vote_type === -1 &&
            voteType === 1
          ) {
            // User's previous vote was a dislike, and the incoming vote is a like
            tweak.likes += 1;
            tweak.dislikes -= 1;
            tweak.votes[userVoteIndex].vote_type = 1; // Update the vote_type
          } else if (
            tweak.votes[userVoteIndex].vote_type === 1 &&
            voteType === 1
          ) {
            // User's previous vote was a like, and the incoming vote is also a like
            tweak.likes -= 1;
            tweak.votes.splice(userVoteIndex, 1); // Remove the user's vote
          } else if (
            tweak.votes[userVoteIndex].vote_type === -1 &&
            voteType === -1
          ) {
            // User's previous vote was a dislike, and the incoming vote is also a dislike
            tweak.dislikes -= 1;
            tweak.votes.splice(userVoteIndex, 1); // Remove the user's vote
          }
        } else {
          tweak.votes.push({ user_id: userId, vote_type: voteType });
          if (voteType === 1) {
            tweak.likes += 1;
          } else if (voteType === -1) {
            tweak.dislikes += 1;
          }
        }
      }
    },
    increaseCommentCount: (state, action) => {
      const tweak = state.entities[action.payload.id];
      if (tweak) {
        tweak.comments_count += 1;
      }
    },
    decreaseCommentCount: (state, action) => {
      const tweak = state.entities[action.payload.id];
      if (tweak) {
        const decreaseCommentCountBy = action.payload.decreaseCommentCountBy;
        tweak.comments_count -= decreaseCommentCountBy;
      }
    },
  },
});

export const { selectAll: selectAllTweaks, selectById: selectTweakById } =
  tweakAdapater.getSelectors((state) => state.tweak);

export const tweakActions = tweakSlice.actions;

export default tweakSlice.reducer;
