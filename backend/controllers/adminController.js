const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const { emitToUser } = require('../config/socket');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get pending NID verifications
// @route   GET /api/admin/verifications/pending
// @access  Private/Admin
const getPendingVerifications = async (req, res) => {
  try {
    // Find all users who are not yet verified
    // This includes users who have submitted NID and are pending review
    const users = await User.find({
      nidVerified: false,
      role: { $ne: 'admin' } // Exclude admins from verification list
    })
      .select('-password')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve NID verification
// @route   PUT /api/admin/verifications/:userId/approve
// @access  Private/Admin
const approveVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.verificationStatus = 'verified';
    user.nidVerified = true;
    await user.save();

    // Create notification for user
    const notification = await Notification.create({
      recipient: user._id,
      sender: req.user._id,
      type: 'verification',
      message: '🎉 Congratulations! Your NID has been verified. You can now create posts.',
    });
    
    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'name avatar');
      emitToUser(io, user._id, 'new-notification', populatedNotification);
    }

    res.status(200).json({
      success: true,
      message: 'User verification approved',
      data: user,
    });
  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject NID verification
// @route   PUT /api/admin/verifications/:userId/reject
// @access  Private/Admin
const rejectVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { reason } = req.body;

    user.verificationStatus = 'rejected';
    user.verificationRejectionReason = reason || 'NID verification failed';
    await user.save();

    // Create notification for user
    const notification = await Notification.create({
      recipient: user._id,
      sender: req.user._id,
      type: 'verification',
      message: `Your NID verification was rejected. Reason: ${user.verificationRejectionReason}`,
    });
    
    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'name avatar');
      emitToUser(io, user._id, 'new-notification', populatedNotification);
    }

    res.status(200).json({
      success: true,
      message: 'User verification rejected',
      data: user,
    });
  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Can't delete yourself
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    // Delete user's posts
    await Post.deleteMany({ author: req.params.userId });

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle user role (user/admin)
// @route   PUT /api/admin/users/:userId/role
// @access  Private/Admin
const toggleUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Can't change your own role
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${user.role}`,
      data: user,
    });
  } catch (error) {
    console.error('Toggle user role error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const pendingVerifications = await User.countDocuments({
      verificationStatus: 'pending',
    });
    const verifiedUsers = await User.countDocuments({ nidVerified: true });

    // Recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Posts by category
    const postsByCategory = await Post.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        pendingVerifications,
        verifiedUsers,
        newUsers,
        postsByCategory,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get recent users
// @route   GET /api/admin/users/recent
// @access  Private/Admin
const getRecentUsers = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: recentUsers,
    });
  } catch (error) {
    console.error('Get recent users error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get recent posts
// @route   GET /api/admin/posts/recent
// @access  Private/Admin
const getRecentPosts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const recentPosts = await Post.find()
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: recentPosts,
    });
  } catch (error) {
    console.error('Get recent posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReports = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const query = status === 'all' ? {} : { status };

    const reports = await Report.find(query)
      .populate('post')
      .populate('reportedBy', 'name email avatar')
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'name email avatar isBanned'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Resolve report
// @route   PATCH /api/admin/reports/:reportId/resolve
// @access  Private/Admin
const resolveReport = async (req, res) => {
  try {
    const { status } = req.body; // 'resolved' or 'dismissed'
    
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    report.status = status || 'resolved';
    await report.save();

    res.status(200).json({
      success: true,
      message: `Report marked as ${report.status}`,
      data: report,
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete post by admin
// @route   DELETE /api/admin/posts/:postId
// @access  Private/Admin
const deletePostByAdmin = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Mark all reports for this post as resolved
    await Report.updateMany({ post: post._id }, { status: 'resolved' });

    // Optionally notify the author
    await Notification.create({
      recipient: post.author,
      sender: req.user._id,
      type: 'system',
      message: `Your post "${post.title}" was removed by an admin for violating community guidelines.`,
    });

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post removed by admin and reports resolved',
    });
  } catch (error) {
    console.error('Admin delete post error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle user ban status
// @route   PATCH /api/admin/users/:userId/ban
// @access  Private/Admin
const toggleUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot ban another admin',
      });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
      data: { isBanned: user.isBanned },
    });
  } catch (error) {
    console.error('Toggle ban error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  deleteUser,
  toggleUserRole,
  getDashboardStats,
  getRecentUsers,
  getRecentPosts,
  getReports,
  resolveReport,
  deletePostByAdmin,
  toggleUserBan,
};
