import { createSlice } from '@reduxjs/toolkit';

// Simulated logged-in user (John Doe - Admin & Verified)
const mockUser = {
  _id: 'u1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin', // Change to 'admin' to access admin pages
  verified: true,
  verificationStatus: 'verified',
  nid: '1234567890',
  nidImage: 'https://via.placeholder.com/400x250?text=NID+Card',
  avatar: 'https://i.pravatar.cc/150?img=1',
  bio: 'Tech enthusiast and sharing economy advocate',
  location: 'Dhaka, Bangladesh',
  joinedDate: '2023-06-15',
  postsCount: 12,
  rating: 4.8,
};

const initialState = {
  user: mockUser,
  token: 'mock-jwt-token-for-testing',
  isAuthenticated: true,
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
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
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

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, updateVerificationStatus } = authSlice.actions;
export default authSlice.reducer;
