import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateConversation: (state, action) => {
      const index = state.conversations.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.conversations[index] = action.payload;
      }
    },
  },
});

export const { 
  setConversations, 
  setActiveConversation, 
  setMessages, 
  addMessage, 
  updateConversation 
} = messageSlice.actions;
export default messageSlice.reducer;
