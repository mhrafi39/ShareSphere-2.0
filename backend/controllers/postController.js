const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadPostImage, deleteFromCloudinary, extractPublicId } = require('../services/cloudinaryService');
const { emitToUser, emitToAdmins } = require('../config/socket');

// Helper function to create notification
const createNotification = async (recipientId, senderId, type, message, postId = null, io = null) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      post: postId,
    });
    
    // Populate notification for real-time emission
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'name avatar')
      .populate('post', 'title');
    
    // Emit socket event for real-time notification
    if (io) {
      emitToUser(io, recipientId, 'new-notification', populatedNotification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// @desc    Get all posts with filters
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const { category, status, search, author, page = 1, limit = 10 } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (author) {
      query.author = author;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find(query)
      .populate('author', 'name email avatar isVerified nidVerified verificationStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email avatar bio location isVerified nidVerified verificationStatus')
      .populate('borrowRequests.user', 'name email avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    // Validate input
    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        // Upload all images to Cloudinary
        const uploadPromises = req.files.map(file => uploadPostImage(file.buffer));
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.map(result => result.url);
      } catch (uploadError) {
        console.error('Post images upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload post images',
        });
      }
    }

    const post = await Post.create({
      title,
      description,
      category,
      location,
      images: imageUrls,
      author: req.user._id,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar isVerified nidVerified verificationStatus');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: populatedPost,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
      });
    }

    const { title, description, category, location, status } = req.body;

    if (title) post.title = title;
    if (description) post.description = description;
    if (category) post.category = category;
    if (location) post.location = location;
    if (status) post.status = status;
    
    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      try {
        // Delete old images from Cloudinary
        if (post.images && post.images.length > 0) {
          const deletePromises = post.images.map(imageUrl => {
            const publicId = extractPublicId(imageUrl);
            return publicId ? deleteFromCloudinary(publicId) : Promise.resolve();
          });
          await Promise.all(deletePromises);
        }
        
        // Upload new images to Cloudinary
        const uploadPromises = req.files.map(file => uploadPostImage(file.buffer));
        const uploadResults = await Promise.all(uploadPromises);
        post.images = uploadResults.map(result => result.url);
      } catch (uploadError) {
        console.error('Post images upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload post images',
        });
      }
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar isVerified nidVerified verificationStatus');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost,
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    // Delete images from Cloudinary
    if (post.images && post.images.length > 0) {
      try {
        const deletePromises = post.images.map(imageUrl => {
          const publicId = extractPublicId(imageUrl);
          return publicId ? deleteFromCloudinary(publicId) : Promise.resolve();
        });
        await Promise.all(deletePromises);
      } catch (deleteError) {
        console.error('Error deleting images from Cloudinary:', deleteError);
        // Continue with post deletion even if image deletion fails
      }
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Like/unlike post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user._id);
      
      // Create notification if liking someone else's post
      if (post.author.toString() !== req.user._id.toString()) {
        const io = req.app.get('io');
        await createNotification(
          post.author,
          req.user._id,
          'like',
          `${req.user.name} liked your post "${post.title}"`,
          post._id,
          io
        );
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        likes: post.likes.length,
        liked: likeIndex === -1,
      },
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Save/unsave post
// @route   POST /api/posts/:id/save
// @access  Private
const toggleSave = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const saveIndex = post.saves.indexOf(req.user._id);

    if (saveIndex > -1) {
      // Unsave
      post.saves.splice(saveIndex, 1);
    } else {
      // Save
      post.saves.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        saves: post.saves.length,
        saved: saveIndex === -1,
      },
    });
  } catch (error) {
    console.error('Toggle save error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Request to borrow
// @route   POST /api/posts/:id/request
// @access  Private
const createBorrowRequest = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user already requested
    const existingRequest = post.borrowRequests.find(
      (req) => req.user.toString() === req.user._id.toString()
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested this item',
      });
    }

    const { message } = req.body;

    post.borrowRequests.push({
      user: req.user._id,
      message: message || '',
    });

    await post.save();

    // Create notification
    const io = req.app.get('io');
    await createNotification(
      post.author,
      req.user._id,
      'request',
      `${req.user.name} requested to borrow your "${post.title}"`,
      post._id,
      io
    );

    res.status(200).json({
      success: true,
      message: 'Borrow request sent successfully',
    });
  } catch (error) {
    console.error('Create borrow request error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get saved posts
// @route   GET /api/posts/saved
// @access  Private
const getSavedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ saves: req.user._id })
      .populate('author', 'name email avatar isVerified nidVerified verificationStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Share/unshare a post
// @route   POST /api/posts/:id/share
// @access  Private
const toggleShare = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user already shared the post
    const shareIndex = post.shares.findIndex(
      (share) => share.user.toString() === req.user._id.toString()
    );

    if (shareIndex > -1) {
      // Unshare
      post.shares.splice(shareIndex, 1);
    } else {
      // Share
      post.shares.push({
        user: req.user._id,
        sharedAt: new Date(),
      });
      
      // Create notification if sharing someone else's post
      if (post.author.toString() !== req.user._id.toString()) {
        const io = req.app.get('io');
        await createNotification(
          post.author,
          req.user._id,
          'share',
          `${req.user.name} shared your post "${post.title}"`,
          post._id,
          io
        );
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        shares: post.shares.length,
        isShared: shareIndex === -1,
      },
    });
  } catch (error) {
    console.error('Toggle share error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
};
