const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  getMe,
  updateProfile,
  changePassword,
  submitNIDVerification,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfile, uploadNID } = require('../config/cloudinary');

// Public routes
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadProfile.single('avatar'), updateProfile);
router.put('/password', protect, changePassword);
router.post('/verify-nid', protect, uploadNID.single('nidImage'), submitNIDVerification);

module.exports = router;
