import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    setCredentials: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // Also update localStorage if user data exists there
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    updateVerificationStatus: (state, action) => {
      if (state.user) {
        state.user.verificationStatus = action.payload.status;
        state.user.nid = action.payload.nid;
        state.user.nidImage = action.payload.nidImage;
      }
    },
  },
});

export const { loginStart, loginSuccess, setCredentials, loginFailure, logout, updateUser, updateVerificationStatus } = authSlice.actions;
export default authSlice.reducer;
