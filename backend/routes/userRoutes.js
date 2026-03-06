const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  searchUsers,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/search', searchUsers);
router.get('/:id', getUserProfile);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Protected routes
router.post('/:id/follow', protect, toggleFollow);

module.exports = router;
