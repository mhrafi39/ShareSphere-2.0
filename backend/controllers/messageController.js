const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');
const { emitToUser, emitToConversation } = require('../config/socket');

// Helper function to generate conversation ID
const generateConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

// @desc    Get user conversations
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;

    // Get all unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userObjectId }, { receiver: userObjectId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', userObjectId] }, { $eq: ['$read', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    // If no conversations, return empty array
    if (conversations.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Manually populate user details
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const sender = await User.findById(conv.lastMessage.sender).select('name avatar');
        const receiver = await User.findById(conv.lastMessage.receiver).select('name avatar');
        
        const otherUser = conv.lastMessage.sender.toString() === userId.toString()
          ? receiver
          : sender;

        return {
          _id: conv._id,
          user: otherUser,
          lastMessage: conv.lastMessage.content,
          timestamp: conv.lastMessage.createdAt,
          unread: conv.unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: formattedConversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;
    const conversationId = generateConversationId(currentUserId, otherUserId);

    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        receiver: currentUserId,
        read: false,
      },
      { read: true }
    );

    res.status(200).json({
      success: true,
      data: messages.reverse(),
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages/:userId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.userId;
    const { content, images } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const conversationId = generateConversationId(senderId, receiverId);

    const message = await Message.create({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      images: images || [],
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Emit socket events for real-time messaging
    const io = req.app.get('io');
    if (io) {
      // Send to receiver's personal room
      emitToUser(io, receiverId, 'new-message', populatedMessage);
      
      // Send to conversation room (if both users are in the conversation)
      emitToConversation(io, conversationId, 'message-sent', populatedMessage);
      
      // Update conversation list for receiver
      emitToUser(io, receiverId, 'conversation-updated', {
        conversationId,
        lastMessage: content.trim(),
        timestamp: populatedMessage.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message',
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  getUnreadCount,
};
