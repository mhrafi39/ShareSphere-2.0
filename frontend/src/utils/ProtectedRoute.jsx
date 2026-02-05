import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Protected route wrapper for authenticated users
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Protected route wrapper for verified users (can create posts)
export const VerifiedRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.verificationStatus !== 'verified') {
    // Redirect to profile with a state message
    return <Navigate to="/profile" state={{ needsVerification: true }} replace />;
  }
  
  return children;
};

// Protected route wrapper for admin users
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

// Public route wrapper (redirects to home if already authenticated)
export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};
