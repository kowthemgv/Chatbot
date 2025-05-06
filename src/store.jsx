import { configureStore, createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: { 
    messages: [],
    streamingMessage: null
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages = [...state.messages, action.payload];
    },
    setStreamingMessage: (state, action) => {
      state.streamingMessage = action.payload;
    },
    appendToStreamingMessage: (state, action) => {
      if (state.streamingMessage) {
        state.streamingMessage = {
          ...state.streamingMessage,
          text: state.streamingMessage.text + action.payload.text
        };
      }
    },
    commitStreamingMessage: (state) => {
      if (state.streamingMessage) {
        state.messages = [...state.messages, state.streamingMessage];
        state.streamingMessage = null;
      }
    },
    clearStreamingMessage: (state) => {
      state.streamingMessage = null;
    }
  },
});

export const { 
  addMessage, 
  setStreamingMessage, 
  appendToStreamingMessage, 
  commitStreamingMessage,
  clearStreamingMessage 
} = chatSlice.actions;

export const store = configureStore({ 
  reducer: { 
    chat: chatSlice.reducer 
  } 
});