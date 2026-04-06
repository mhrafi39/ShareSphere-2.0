const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    label: {
      type: String,
      required: false,
      enum: ['Excellent', 'Good', 'Average', 'Bad', 'Very Bad'],
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters'],
      default: '',
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from reviewing the same person multiple times if desired.
// For now, we will allow multiple reviews over time, but we can index for performance.
reviewSchema.index({ reviewee: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
