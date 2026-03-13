const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  toggleSave,
  toggleShare,
  createBorrowRequest,
  getSavedPosts,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { uploadPost } = require('../config/cloudinary');

// Public routes
router.get('/', getPosts);
router.get('/:id', getPost);

// Protected routes
router.post('/', protect, uploadPost.array('images', 5), createPost);
router.put('/:id', protect, uploadPost.array('images', 5), updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/save', protect, toggleSave);
router.post('/:id/share', protect, toggleShare);
router.post('/:id/request', protect, createBorrowRequest);
router.get('/saved/all', protect, getSavedPosts);

module.exports = router;
