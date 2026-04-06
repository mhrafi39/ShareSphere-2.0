import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { store } from './store/store';
import { SocketProvider } from './context/SocketContext';
import { HelmetProvider } from 'react-helmet-async';
import MainLayout from './layouts/MainLayout';
import { ProtectedRoute, AdminRoute, PublicRoute, VerifiedRoute } from './utils/ProtectedRoute';
import { authAPI, notificationsAPI } from './services/api';
import { setCredentials, logout } from './features/authSlice';
import { setNotifications } from './features/notificationSlice';
import ChatBotWidget from './components/ChatBotWidget';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailsPage from './pages/PostDetailsPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminVerification from './pages/AdminVerification';
import AdminUsersPage from './pages/AdminUsersPage';
import VerifyNIDPage from './pages/VerifyNIDPage';
import SavedPage from './pages/SavedPage';
import NotFoundPage from './pages/NotFoundPage';

function AppRoutes() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await authAPI.getMe();
          if (response.data.success) {
            dispatch(setCredentials({
              user: response.data.data,
              token: storedToken,
            }));
            
            // Fetch notifications to initialize unread count
            try {
              const notifResponse = await notificationsAPI.getNotifications();
              if (notifResponse.data.success) {
                dispatch(setNotifications(notifResponse.data.data));
              }
            } catch (notifError) {
              console.error('Failed to fetch notifications:', notifError);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          dispatch(logout());
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes - Redirect to /home if authenticated */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><VerifyOTPPage /></PublicRoute>} />
        
        {/* Protected Routes - Require authentication */}
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/verify-nid" element={<ProtectedRoute><VerifyNIDPage /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
        <Route path="/create" element={<VerifiedRoute><CreatePostPage /></VerifiedRoute>} />
        <Route path="/post/:id" element={<ProtectedRoute><PostDetailsPage /></ProtectedRoute>} />
        
        {/* Admin Routes - Require admin role */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/verify" element={<AdminRoute><AdminVerification /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        
        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <HelmetProvider>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <Provider store={store}>
          <SocketProvider>
            <Router>
              <AppRoutes />
              <ChatBotWidget />
            </Router>
          </SocketProvider>
        </Provider>
      </div>
    </HelmetProvider>
  );
}

export default App;