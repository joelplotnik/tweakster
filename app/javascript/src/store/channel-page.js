import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  channel: null,
};

const channelPageSlice = createSlice({
  name: 'channelPage',
  initialState,
  reducers: {
    setChannel: (state, action) => {
      state.channel = action.payload;
    },
    updateSubscribedState: (state, action) => {
      state.channel.subscribed = action.payload;
    },
    updateSubscriberCount: (state, action) => {
      state.channel.subscriber_count = action.payload;
    },
  },
});

export const channelPageActions = channelPageSlice.actions;
export default channelPageSlice.reducer;
