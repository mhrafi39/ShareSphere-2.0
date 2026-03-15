const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const Notification = require('../models/Notification');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');
const { uploadProfilePicture, uploadNIDImage, deleteFromCloudinary, extractPublicId } = require('../services/cloudinaryService');
const { emitToUser, emitToAdmins } = require('../config/socket');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register a new user (sends OTP for email verification)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any old OTPs for this email
    await OTP.deleteMany({ email });

    // Save new OTP to database
    await OTP.create({
      email,
      otp,
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, name);

    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
      });
    }

    // Return success - do NOT create user yet (user is created after OTP verification)
    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify OTP and create user account
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, name, password } = req.body;

    // Validate input
    if (!email || !otp || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Find OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      verified: false,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Check if user already exists (double check)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      isVerified: true, // Mark as verified since OTP is confirmed
    });

    // Mark OTP as verified and delete
    await OTP.deleteOne({ _id: otpRecord._id });

    // Send welcome email
    await sendWelcomeEmail(email, name);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        isVerified: user.isVerified,
        token,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Delete old OTPs
    await OTP.deleteMany({ email });

    // Save new OTP
    await OTP.create({
      email,
      otp,
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, name || 'User');

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        isVerified: user.isVerified,
        nidVerified: user.nidVerified,
        nidNumber: user.nidNumber,
        verificationStatus: user.verificationStatus,
        verificationRejectionReason: user.verificationRejectionReason,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    console.log('Update profile request received');
    console.log('Body:', req.body);
    console.log('File:', req.file ? 'File present' : 'No file');
    console.log('User ID:', req.user?.id);
    
    const { name, bio, location } = req.body;
    
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    
    // Handle avatar upload
    if (req.file) {
      console.log('Processing avatar upload...');
      try {
        // Delete old avatar from Cloudinary if exists
        if (user.avatar) {
          const publicId = extractPublicId(user.avatar);
          if (publicId) {
            console.log('Deleting old avatar:', publicId);
            await deleteFromCloudinary(publicId);
          }
        }
        
        // Upload new avatar to Cloudinary
        console.log('Uploading new avatar to Cloudinary...');
        const uploadResult = await uploadProfilePicture(req.file.buffer);
        user.avatar = uploadResult.url;
        console.log('Avatar uploaded successfully:', uploadResult.url);
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload avatar image',
          error: uploadError.message,
        });
      }
    }

    console.log('Saving user...');
    await user.save();
    console.log('User saved successfully');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Submit NID for verification
// @route   POST /api/auth/verify-nid
// @access  Private
const submitNIDVerification = async (req, res) => {
  try {
    console.log('NID Verification Request:');
    console.log('- User ID:', req.user.id);
    console.log('- NID Number from body:', req.body.nidNumber);
    console.log('- File received:', req.file ? 'Yes' : 'No');
    
    const { nidNumber } = req.body;

    if (!nidNumber || !req.file) {
      console.log('Validation failed: Missing nidNumber or file');
      return res.status(400).json({
        success: false,
        message: 'Please provide NID number and image',
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.nidVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your NID is already verified',
      });
    }

    try {
      console.log('Starting Cloudinary upload...');
      
      // Delete old NID image from Cloudinary if exists
      if (user.nidImage) {
        const publicId = extractPublicId(user.nidImage);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
      
      // Upload NID image to Cloudinary
      const uploadResult = await uploadNIDImage(req.file.buffer);
      console.log('Cloudinary upload successful:', uploadResult.url);
      
      user.nidNumber = nidNumber;
      user.nidImage = uploadResult.url;
      user.verificationStatus = 'pending';
      
      await user.save();
      console.log('User updated successfully. Verification status:', user.verificationStatus);

      // Notify user about submission confirmation
      const userNotification = await Notification.create({
        recipient: user._id,
        type: 'verification',
        message: 'Your NID verification has been submitted successfully. Please wait for admin approval.',
      });
      
      // Notify all admins about new verification request
      const admins = await User.find({ role: 'admin' });
      const io = req.app.get('io');
      
      for (const admin of admins) {
        const adminNotification = await Notification.create({
          recipient: admin._id,
          sender: user._id,
          type: 'verification',
          message: `${user.name} submitted NID for verification`,
        });
        
        // Emit real-time notification to admin
        if (io) {
          const populatedNotification = await Notification.findById(adminNotification._id)
            .populate('sender', 'name avatar');
          emitToUser(io, admin._id, 'new-notification', populatedNotification);
        }
      }
      
      // Also broadcast to admin room
      if (io) {
        emitToAdmins(io, 'new-verification-request', {
          userId: user._id,
          userName: user.name,
          message: `${user.name} submitted NID for verification`,
        });
      }

      res.status(200).json({
        success: true,
        message: 'NID submitted for verification. Please wait for admin approval.',
        data: {
          verificationStatus: user.verificationStatus,
        },
      });
    } catch (uploadError) {
      console.error('NID upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload NID image: ' + uploadError.message,
      });
    }
  } catch (error) {
    console.error('Submit NID verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  getMe,
  updateProfile,
  changePassword,
  submitNIDVerification,
};
