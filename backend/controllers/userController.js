const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { emitToUser } = require('../config/socket');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's posts
    const posts = await Post.find({ author: req.params.id })
      .populate('author', 'name email avatar isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        user,
        posts,
        postsCount: posts.length,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Follow/Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
const toggleFollow = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Can't follow yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      });
    }

    const currentUser = await User.findById(req.user._id);

    const followingIndex = currentUser.following.indexOf(req.params.id);
    const followerIndex = userToFollow.followers.indexOf(req.user._id);

    if (followingIndex > -1) {
      // Unfollow
      currentUser.following.splice(followingIndex, 1);
      userToFollow.followers.splice(followerIndex, 1);
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user._id);

      // Create notification
      const notification = await Notification.create({
        recipient: req.params.id,
        sender: req.user._id,
        type: 'follow',
        message: `${req.user.name} started following you`,
      });
      
      // Populate and emit real-time notification
      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'name avatar');
      
      const io = req.app.get('io');
      if (io) {
        emitToUser(io, req.params.id, 'new-notification', populatedNotification);
      }
    }

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      data: {
        following: followingIndex === -1,
        followersCount: userToFollow.followers.length,
      },
    });
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user followers
// @route   GET /api/users/:id/followers
// @access  Public
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'followers',
      'name email avatar bio isVerified'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user.followers,
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user following
// @route   GET /api/users/:id/following
// @access  Public
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'following',
      'name email avatar bio isVerified'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user.following,
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name email avatar bio isVerified nidVerified')
      .limit(20);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  searchUsers,
};
