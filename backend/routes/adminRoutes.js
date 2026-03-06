const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  deleteUser,
  toggleUserRole,
  getDashboardStats,
  getRecentUsers,
  getRecentPosts,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.get('/stats', protect, admin, getDashboardStats);
router.get('/users/recent', protect, admin, getRecentUsers);
router.get('/posts/recent', protect, admin, getRecentPosts);
router.get('/users', protect, admin, getAllUsers);
router.get('/verifications/pending', protect, admin, getPendingVerifications);
router.put('/verifications/:userId/approve', protect, admin, approveVerification);
router.put('/verifications/:userId/reject', protect, admin, rejectVerification);
router.delete('/users/:userId', protect, admin, deleteUser);
router.put('/users/:userId/role', protect, admin, toggleUserRole);

module.exports = router;
