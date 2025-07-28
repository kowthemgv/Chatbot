import { configureStore, createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: { messages: [] },
  reducers: {
    addMessage: (state, action) => {
      state.messages = [...state.messages, action.payload];
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    loadMessages: (state, action) => {
      state.messages = action.payload;
    },
  },
});

export const { addMessage, clearMessages, loadMessages } = chatSlice.actions;
export const store = configureStore({ 
  reducer: { 
    chat: chatSlice.reducer 
  } 
});