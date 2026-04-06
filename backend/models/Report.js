const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for reporting'],
      enum: ['Spam', 'Inappropriate Content', 'Scam or Fraud', 'Harassment', 'Other'],
    },
    details: {
      type: String,
      maxlength: [500, 'Details cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from reporting the same post multiple times
reportSchema.index({ post: 1, reportedBy: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
