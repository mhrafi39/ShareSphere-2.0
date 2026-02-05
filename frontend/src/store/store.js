import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import notificationReducer from '../features/notificationSlice';
import messageReducer from '../features/messageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    messages: messageReducer,
  },
});
