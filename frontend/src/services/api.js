import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add token and handle content type
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only set Content-Type to JSON if data is not FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    // If it is FormData, let axios set the Content-Type automatically with boundary
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if we're not already on login/register pages
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/verify-otp', '/forgot-password'];
      
      if (!publicPaths.includes(currentPath)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => {
    // FormData is sent as-is, axios will set the correct Content-Type with boundary
    return api.put('/auth/profile', data);
  },
  changePassword: (data) => api.put('/auth/password', data),
  submitNIDVerification: (data) => {
    // Send NID data as FormData
    // Don't set Content-Type manually - let axios set it with the boundary
    return api.post('/auth/verify-nid', data);
  },
};

// Posts API calls
export const postsAPI = {
  getPosts: (params) => api.get('/posts', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => {
    // Send post data as FormData to support images
    // Don't set Content-Type manually - let axios set it with the boundary
    return api.post('/posts', data);
  },
  updatePost: (id, data) => {
    // FormData is sent as-is, axios will set the correct Content-Type with boundary
    return api.put(`/posts/${id}`, data);
  },
  deletePost: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  toggleSave: (id) => api.post(`/posts/${id}/save`),
  toggleShare: (id) => api.post(`/posts/${id}/share`),
  requestBorrow: (id, data) => api.post(`/posts/${id}/request`, data),
  getSavedPosts: () => api.get('/posts/saved/all'),
};

// Users API calls
export const usersAPI = {
  getUserProfile: (id) => api.get(`/users/${id}`),
  toggleFollow: (id) => api.post(`/users/${id}/follow`),
  getFollowers: (id) => api.get(`/users/${id}/followers`),
  getFollowing: (id) => api.get(`/users/${id}/following`),
  searchUsers: (query) => api.get('/users/search', { params: { query } }),
};

// Notifications API calls
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications'),
};

// Messages API calls
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId, params) => api.get(`/messages/${userId}`, { params }),
  sendMessage: (userId, data) => api.post(`/messages/${userId}`, data),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  getUnreadCount: () => api.get('/messages/unread/count'),
};

// Admin API calls
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getRecentUsers: (limit = 5) => api.get('/admin/users/recent', { params: { limit } }),
  getRecentPosts: (limit = 5) => api.get('/admin/posts/recent', { params: { limit } }),
  getPendingVerifications: () => api.get('/admin/verifications/pending'),
  approveVerification: (userId) => api.put(`/admin/verifications/${userId}/approve`),
  rejectVerification: (userId, data) => api.put(`/admin/verifications/${userId}/reject`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  toggleUserRole: (userId) => api.put(`/admin/users/${userId}/role`),
};

// ChatBot API calls
export const chatBotAPI = {
  sendMessage: (data) => api.post('/chatbot/message', data),
};

export default api;
